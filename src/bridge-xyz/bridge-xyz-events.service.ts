import { Injectable, Logger } from '@nestjs/common'
import { Subject } from 'rxjs'
import type { BridgeLiqAddressDrainDTO, VirtualAccountActivityItem } from './bridge-xyz.dto'
import { DrainState, VirtualAddressActivityType } from './bridge-xyz.types'

@Injectable()
export class BridgeXyzEventsService {
  private readonly logger = new Logger(BridgeXyzEventsService.name)

  // Event subjects
  private liquidationAddressDrainProcessed: Subject<BridgeLiqAddressDrainDTO> = new Subject()
  private virtualAccountPaymentProcessed: Subject<VirtualAccountActivityItem> = new Subject()

  // Observable streams
  public liquidationAddressDrainProcessed$ = this.liquidationAddressDrainProcessed.asObservable()
  public virtualAccountPaymentProcessed$ = this.virtualAccountPaymentProcessed.asObservable()

  // Methods to emit events
  public emitLiquidationAddressDrainProcessed(event: BridgeLiqAddressDrainDTO): void {
    this.logger.log('BridgeXyzEventsService -> emitLiquidationAddressDrainProcessed', event)
    this.liquidationAddressDrainProcessed.next(event)
  }

  public emitVirtualAccountPaymentProcessed(event: VirtualAccountActivityItem): void {
    this.logger.log('BridgeXyzEventsService -> emitVirtualAccountPaymentProcessed', event)
    this.virtualAccountPaymentProcessed.next(event)
  }

  // Method to process bridge events and emit appropriate events
  public processBridgeEvent(bridgeEventWebhookDTO: any): void {
    if (bridgeEventWebhookDTO.event_category === 'liquidation_address.drain') {
      this.logger.log('BridgeXyzEventsService -> processBridgeEvent -> Liq address drain event caught.', bridgeEventWebhookDTO)
      const eventObject = bridgeEventWebhookDTO.event_object as BridgeLiqAddressDrainDTO
      if (eventObject.state === DrainState.PAYMENT_PROCESSED) {
        this.emitLiquidationAddressDrainProcessed(eventObject)
      }
    }

    if (bridgeEventWebhookDTO.event_category === 'virtual_account.activity') {
      this.logger.log('BridgeXyzEventsService -> processBridgeEvent -> Virtual account activity event caught.', bridgeEventWebhookDTO)
      const eventObject = bridgeEventWebhookDTO.event_object as VirtualAccountActivityItem
      if (eventObject.type === VirtualAddressActivityType.PAYMENT_PROCESSED) {
        this.emitVirtualAccountPaymentProcessed(eventObject)
      }
    }
  }
}
