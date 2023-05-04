import { Region } from "../types";
export declare function onData<Data extends Record<string, any>>(data: {
    data: Data;
}): Promise<Data>;
export declare function onError(error: Error): Promise<never>;
export declare function formatAppRegion(region: string): Region;
//# sourceMappingURL=utils.d.ts.map