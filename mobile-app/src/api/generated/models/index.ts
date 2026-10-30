/* tslint:disable */
/* eslint-disable */
/**
 * 
 * @export
 * @interface CreateTicketDto
 */
export interface CreateTicketDto {
    /**
     * Code from GET /reasons
     */
    reason: ReasonCode;
}


/**
 * 
 * @export
 * @enum {string}
 */
export enum ReasonCode {
    FIEVRE = 'fievre',
    RENOUVELLEMENT_ORDONNANCE = 'renouvellement-ordonnance',
    DOULEUR = 'douleur',
    AUTRE = 'autre'
}

/**
 * 
 * @export
 * @interface ReasonDto
 */
export interface ReasonDto {
    /**
     * 
     */
    code: ReasonCode;
    /**
     * 
     */
    label: string;
}


/**
 * 
 * @export
 * @interface TicketResponseDto
 */
export interface TicketResponseDto {
    /**
     * 
     */
    id: string;
    /**
     * 
     */
    reason: string;
    /**
     * 
     */
    status: TicketResponseDtoStatusEnum;
    /**
     * 1 = next to be called, 0 when not waiting
     */
    position: number;
    /**
     * Position x average consultation time
     */
    estimatedWaitMinutes: number;
}

/**
* @export
* @enum {string}
*/
export enum TicketResponseDtoStatusEnum {
    WAITING = 'waiting',
    CALLED = 'called',
    CANCELLED = 'cancelled'
}

