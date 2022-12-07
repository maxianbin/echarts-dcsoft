import TimeScale from './Time';
import Scale from './Scale';

class TimeSegmentsScale extends TimeScale {
    segments: any = [];

    constructor(setting: any) {
        super(setting);
        this.segments = setting.segments;
    }
}


Scale.registerClass(TimeSegmentsScale);

export default TimeSegmentsScale;
