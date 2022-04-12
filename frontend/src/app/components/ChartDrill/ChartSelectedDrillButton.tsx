/**
 * Datart
 *
 * Copyright 2021
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { ArrowDownOutlined } from '@ant-design/icons';
import ChartDatasetContext from 'app/pages/ChartWorkbenchPage/contexts/ChartDatasetContext';
import classnames from 'classnames';
import { FC, memo, useContext } from 'react';
import styled from 'styled-components/macro';
import { FONT_SIZE_HEADING } from 'styles/StyleConstants';
import { IW } from '../IconWrapper';

const ChartSelectedDrillButton: FC<{ fontSize?: string /** eg. 32px */ }> =
  memo(({ fontSize }) => {
    const { drillOption, onDrillOptionChange } =
      useContext(ChartDatasetContext);

    return (
      <StyledChartSelectedDrillButton
        fontSize={fontSize || FONT_SIZE_HEADING}
        className={classnames({
          active: drillOption?.isSelectedDrill(),
        })}
        onClick={() => {
          if (drillOption) {
            drillOption?.toggleSelectedDrill();
            onDrillOptionChange?.(drillOption);
          }
        }}
      >
        <ArrowDownOutlined />
      </StyledChartSelectedDrillButton>
    );
  });

export default ChartSelectedDrillButton;

const StyledChartSelectedDrillButton = styled(IW)`
  color: ${p => p.theme.textColorLight};
  cursor: pointer;

  &.active {
    color: ${p => p.theme.primary};
  }
`;
