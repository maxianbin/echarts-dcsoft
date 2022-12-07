/*
* Licensed to the Apache Software Foundation (ASF) under one
* or more contributor license agreements.  See the NOTICE file
* distributed with this work for additional information
* regarding copyright ownership.  The ASF licenses this file
* to you under the Apache License, Version 2.0 (the
* "License"); you may not use this file except in compliance
* with the License.  You may obtain a copy of the License at
*
*   http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing,
* software distributed under the License is distributed on an
* "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
* KIND, either express or implied.  See the License for the
* specific language governing permissions and limitations
* under the License.
*/

import Axis from '../Axis';
import Model from '../../model/Model';
import { DimensionName, OrdinalSortInfo, ScaleTick } from '../../util/types';
import Scale from '../../scale/Scale';
import CartesianAxisModel, { CartesianAxisPosition } from './AxisModel';
import Grid from './Grid';
import { OptionAxisType } from '../axisCommonTypes';
import OrdinalScale from '../../scale/Ordinal';

interface TickCoord {
    coord: number;
    // That is `scaleTick.value`.
    tickValue?: ScaleTick['value'];
}
interface Axis2D {
    /**
     * Transform global coord to local coord,
     * i.e. let localCoord = axis.toLocalCoord(80);
     */
    toLocalCoord(coord: number): number;

    /**
     * Transform global coord to local coord,
     * i.e. let globalCoord = axis.toLocalCoord(40);
     */
    toGlobalCoord(coord: number): number;
}
class Axis2D extends Axis {

    /**
     * Axis position
     *  - 'top'
     *  - 'bottom'
     *  - 'left'
     *  - 'right'
     */
    readonly position: CartesianAxisPosition;

    /**
     * Index of axis, can be used as key
     * Injected outside.
     */
    index: number = 0;

    /**
     * Axis model. Injected outside
     */
    model: CartesianAxisModel;

    /**
     * Injected outside.
     */
    grid: Grid;


    constructor(
        dim: DimensionName,
        scale: Scale,
        coordExtent: [number, number],
        axisType?: OptionAxisType,
        position?: CartesianAxisPosition
    ) {
        super(dim, scale, coordExtent);
        this.type = axisType || 'value';
        this.position = position || 'bottom';
    }

    /**
     * Implemented in <module:echarts/coord/cartesian/Grid>.
     * @return If not on zero of other axis, return null/undefined.
     *         If no axes, return an empty array.
     */
    getAxesOnZeroOf: () => Axis2D[];

    isHorizontal(): boolean {
        const position = this.position;
        return position === 'top' || position === 'bottom';
    }

    /**
     * Each item cooresponds to this.getExtent(), which
     * means globalExtent[0] may greater than globalExtent[1],
     * unless `asc` is input.
     *
     * @param {boolean} [asc]
     * @return {Array.<number>}
     */
    getGlobalExtent(asc?: boolean): [number, number] {
        const ret = this.getExtent();
        ret[0] = this.toGlobalCoord(ret[0]);
        ret[1] = this.toGlobalCoord(ret[1]);
        asc && ret[0] > ret[1] && ret.reverse();
        return ret;
    }

    pointToData(point: number[], clamp?: boolean): number {
        return this.coordToData(this.toLocalCoord(point[this.dim === 'x' ? 0 : 1]), clamp);
    }

    /**
     * Set ordinalSortInfo
     * @param info new OrdinalSortInfo
     */
    setCategorySortInfo(info: OrdinalSortInfo): boolean {
        if (this.type !== 'category') {
            return false;
        }

        this.model.option.categorySortInfo = info;
        (this.scale as OrdinalScale).setSortInfo(info);
    }

    getSegmentsModel(): Model {
        return this.model.getSegmentsModel()
    }

    /**
     * Different from `zrUtil.map(axis.getTicks(), axis.dataToCoord, axis)`,
     * `axis.getTicksCoords` considers `onBand`, which is used by
     * `boundaryGap:true` of category axis and splitLine and splitArea.
     * @param opt.tickModel default: axis.model.getModel('axisTick')
     * @param opt.clamp If `true`, the first and the last
     *        tick must be at the axis end points. Otherwise, clip ticks
     *        that outside the axis extent.
     */
    getTicksCoords(opt?: {
        tickModel?: Model,
        clamp?: boolean
    }): TickCoord[] {
        return super.getTicksCoords();
    }

    getMinorTicksCoords(): TickCoord[][] {
        let minorTicksCoords:TickCoord[][] = super.getMinorTicksCoords()
        return minorTicksCoords;
    }

}

export default Axis2D;
