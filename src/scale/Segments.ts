import {Dictionary, ScaleTick} from '../util/types';
import Scale from '../scale/Scale';
import IntervalScale from './Interval';
import * as numberUtil from '../util/number';
import * as helper from './helper';

const roundNumber = numberUtil.round;

class SegmentsScale<SETTING extends Dictionary<unknown> = Dictionary<unknown>> extends IntervalScale<SETTING> {
    segments: Array<any>;

    constructor(segments: Array<any>) {
        super();
        this.segments = segments;
    }

    normalizeBySegment(val: number, extent: [number, number]): number {
        extent[0] = 0;
        extent[1] = extent[1] - extent[0];
        return helper.normalize(val, extent);
    }

    updateSegments(axisExtent: [number, number]) {
        const axisSize = axisExtent[1] - axisExtent[0];
        const segments = this.segments;
        let splitNumber;
        const extent = this.getExtent();
        const lastSegment = segments[segments.length - 1];
        const lastTo = lastSegment.to;
        if (extent[1] > lastTo) {
            segments.push({
                from: lastTo,
                to: extent[1]
            });
        }
        let left = 0;
        let tickPixels;
        for (let i = 0; i < segments.length; i++) {
            segments[i].splitNumber = segments[i].splitNumber || 5;
            segments[i].interval = (segments[i].to - segments[i].from) / segments[i].splitNumber;
            splitNumber = segments[i].splitNumber || (segments[i].to - segments[i].from) / 5;
            tickPixels = segments[i].tickPixels || 5;
            let segmentSize = segments[i].length ? segments[i].length * axisSize : tickPixels * splitNumber;
            segments[i].left = left;
            if (i === segments.length - 1) { // the last
                segmentSize = axisSize - left;
            }
            segments[i].size = segmentSize;
            segments[i].extent = [left, left + segmentSize];
            left += segmentSize;
        }
    }

    /**
     * @param expandToNicedExtent Whether expand the ticks to niced extent.
     */
    getTicks(expandToNicedExtent?: boolean): ScaleTick[] {
        const segments = this.segments;
        let splitNumber;
        let seg;
        let from;
        let ticks = [] as ScaleTick[];
        let subticks;
        for (let i = 0; i < segments.length; i++) {
            seg = segments[i];
            from = seg.from;
            splitNumber = seg.splitNumber;
            subticks = [];
            for (let j = 0; i === segments.length - 1 ? j <= splitNumber : j < splitNumber; j++) {
                subticks.push({
                    segmentIndex: i,
                    value: j * seg.interval + from
                });
            }
            ticks = ticks.concat(subticks);
        }
        return ticks;
    }

    getMinorTicks(splitNumber: number): number[][] {
        const ticks = this.getTicks(true);
        const minorTicks = [];
        for (let i = 1; i < ticks.length; i++) {
            const nextTick = ticks[i];
            const prevTick = ticks[i - 1];
            // /console.log(prevTick)
            const segment = this.segments[(prevTick as any).segmentIndex];
            if (!segment) {
                continue;
            }
            let count = 0;
            const minorTicksGroup = [];
            const interval = segment.interval;
            const minorInterval = interval / splitNumber;
            while (count < splitNumber - 1) {
                const minorTick = roundNumber(prevTick.value + (count + 1) * minorInterval);
                // For the first and last interval. The count may be less than splitNumber.
                if (minorTick > prevTick.value && minorTick < nextTick.value) {
                    minorTicksGroup.push(minorTick);
                }
                count++;
            }
            minorTicks.push(minorTicksGroup);
        }
        return minorTicks;
    }
}

Scale.registerClass(SegmentsScale);

export default SegmentsScale;
