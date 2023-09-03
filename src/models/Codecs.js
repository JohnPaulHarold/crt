/** 
 * @enum {{title: string, contentType: string}}
 * @todo this probably isn't an enum
 */
export const Codecs = [
    {
        title: 'Advanced Video Coding, h.264',
        contentType: '; codecs="avc1.42E01E"',
    },
    {
        title: 'High Efficiency Video Coding, h.265/HEVC | hvc1',
        contentType: '; codecs="hvc1.1.6.L93.90"',
    },
    {
        title: 'High Efficiency Video Coding, h.265/HEVC | hev1',
        contentType: '; codecs="hev1.1.6.L93.90"',
    },
    {
        title: 'AOMedia Video 1, AV1 | 8 bits',
        contentType: '; codecs="av01.0.00M.08"',
    },
    {
        title: 'AOMedia Video 1, AV1 | 10 bits',
        contentType: '; codecs="av01.0.00M.10"',
    },
    {
        title: 'AOMedia Video 1, AV1 | 12 bits',
        contentType: '; codecs="av01.0.00M.12"',
    },
    { title: 'Dolby Vision, dvhe', contentType: '; codecs="dvhe.05.07"' },
    { title: 'Dolby Vision, dvh1', contentType: '; codecs="dvh1.05.07"' },
];
