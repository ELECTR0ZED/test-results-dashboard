import createGateway from '@electr0zed/auth-gateway-cf';
import config from './config';

export default createGateway(config);

export { SessionDO } from '@electr0zed/auth-gateway-cf';