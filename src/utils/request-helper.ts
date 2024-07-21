import { Request } from '@google-cloud/functions-framework';

export class RequestHelper {
    public static getXEnvoyOriginalPath(req: Request): string {
        const xEnvoyOriginalPath = req.headers['x-envoy-original-path'];

        if (typeof xEnvoyOriginalPath === 'string') {
            return xEnvoyOriginalPath;
        }

        return '';
    }
}
