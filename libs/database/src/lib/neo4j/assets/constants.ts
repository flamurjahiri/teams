export const NEO_4J_DRIVERS = 'NEO_4J_DRIVERS';
export const NEO_4J_HEALTH_CHECK = 'NEO_4J_HEALTH_CHECK';

export const NEO_4J_CONNECTION_DRIVER = (connectionName?: string) => `NEO_4J_DRIVER_${connectionName || 'default'}`;

export const NEO_4J_DATABASE = (database: string, connectionName?: string) => `NEO_4J_DATABASE_${database}_${connectionName || 'default'}`;
