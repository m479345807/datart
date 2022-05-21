import { FONT_DEFAULT } from 'app/constants';
import {
  BoardType,
  ControllerWidgetContent,
  Relation,
  ServerRelation,
  ServerWidget,
} from 'app/pages/DashBoardPage/pages/Board/slice/types';
import { Widget } from 'app/pages/DashBoardPage/types/widgetTypes';
import { VALUE_SPLITTER } from 'app/pages/DashBoardPage/utils/widget';
import { setLatestVersion, versionCanDo } from '../utils';
import {
  APP_VERSION_BETA_0,
  APP_VERSION_BETA_2,
  APP_VERSION_BETA_4,
} from './../constants';
import { WidgetBeta3 } from './types';
import {
  convertToBeta4AutoWidget,
  convertWidgetToBeta4,
} from './utils/beta4utils';

/**
 *
 * JSON.parse(relation.config)
 * @param {ServerRelation[]} [relations=[]]
 * @return {*}  {Relation[]}
 */
export const convertWidgetRelationsToObj = (
  relations: ServerRelation[] = [],
): Relation[] => {
  if (!Array.isArray(relations)) {
    return [];
  }
  return relations
    .map(relation => {
      try {
        return { ...relation, config: JSON.parse(relation.config) };
      } catch (error) {
        return { ...relation };
      }
    })
    .filter(re => !!re) as Relation[];
};

/**
 *
 * migrate beta0
 * @param {WidgetBeta3} [widget]
 * @return {*}
 */
export const beta0 = (widget?: WidgetBeta3) => {
  if (!widget) return undefined;
  if (!versionCanDo(APP_VERSION_BETA_0, widget?.config.version)) return widget;

  // 1.放弃了 filter type 新的是 controller
  if ((widget.config.type as any) === 'filter') {
    return undefined;
  }
  // 2.migration about font 5 旧数据没有 widget.config.nameConfig。统一把旧数据填充上fontDefault
  widget.config.nameConfig = {
    ...FONT_DEFAULT,
    ...widget.config.nameConfig,
  };

  // 3.处理 assistViewFields 旧数据 assistViewFields 是 string beta0 使用数组存储的
  if (widget.config.type === 'controller') {
    const content = widget.config.content as ControllerWidgetContent;
    if (typeof content?.config?.assistViewFields === 'string') {
      content.config.assistViewFields = (
        content.config.assistViewFields as string
      ).split(VALUE_SPLITTER);
    }
  }
  widget.config.version = APP_VERSION_BETA_0;
  return widget;
};

export const beta2 = (widget?: WidgetBeta3) => {
  if (!widget) return undefined;
  if (!versionCanDo(APP_VERSION_BETA_2, widget?.config.version)) return widget;
  // widget.lock
  if (!widget.config.lock) {
    widget.config.lock = false;
  }
  widget.config.version = APP_VERSION_BETA_2;
  return widget;
};
// beta3 没有变动

// beta4 widget 重构 支持group
export const beta4 = (boardType: BoardType, widget?: Widget | WidgetBeta3) => {
  if (!widget) return undefined;
  if (!versionCanDo(APP_VERSION_BETA_4, widget?.config.version))
    return widget as Widget;
  let beta4Widget = widget as any;
  if (widget.config.version !== APP_VERSION_BETA_4) {
    beta4Widget = convertWidgetToBeta4(beta4Widget as WidgetBeta3);
  }

  beta4Widget = convertToBeta4AutoWidget(boardType, beta4Widget);
  return beta4Widget as Widget;
};
const finaleWidget = (widget?: Widget) => {
  if (!widget) return undefined;
  widget.config = setLatestVersion(widget.config);
  return widget;
};
export const parseServerWidget = (sWidget: ServerWidget) => {
  try {
    sWidget.config = JSON.parse(sWidget.config);
  } catch (error) {
    return undefined;
  }
  sWidget.relations = convertWidgetRelationsToObj(
    sWidget.relations,
  ) as unknown as ServerRelation[];
  return sWidget as unknown as WidgetBeta3;
};
/**
 *
 * migrateWidgets
 * @param {ServerWidget[]} widgets
 * @return {*}
 */
export const migrateWidgets = (
  widgets: ServerWidget[],
  boardType: BoardType,
) => {
  if (!Array.isArray(widgets)) {
    return [];
  }

  const targetWidgets = widgets
    .map(sWidget => {
      return parseServerWidget(sWidget);
    })
    .filter(widget => !!widget)
    .map(widget => {
      let resWidget = beta0(widget);

      resWidget = beta2(resWidget);

      let beta4Widget = beta4(boardType, resWidget);

      beta4Widget = finaleWidget(beta4Widget as Widget);

      return beta4Widget;
    })
    .filter(widget => !!widget);
  return targetWidgets as Widget[];
};
