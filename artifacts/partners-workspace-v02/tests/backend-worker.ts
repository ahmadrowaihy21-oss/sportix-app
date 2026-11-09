import {sandboxApi} from '../lib/sandbox-api';
export default {fetch(request:Request,env:{DB:D1Database}){return sandboxApi(request,env.DB,request.headers.get('oai-authenticated-user-id'));}};
