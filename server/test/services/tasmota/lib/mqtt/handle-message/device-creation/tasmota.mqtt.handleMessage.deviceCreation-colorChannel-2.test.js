const sinon = require('sinon');
const { expect } = require('chai');

const { fake, assert } = sinon;
const TasmotaHandler = require('../../../../../../../services/tasmota/lib');
const { EVENTS, WEBSOCKET_MESSAGE_TYPES } = require('../../../../../../../utils/constants');

const messages = require('../../../device-creation/colorChannel-2.json');

const mqttService = {
  device: {
    publish: fake.returns(null),
  },
};
const gladys = {
  event: {
    emit: fake.returns(null),
  },
  stateManager: {
    get: fake.returns(null),
  },
};
const serviceId = 'service-uuid-random';

describe('Tasmota - MQTT - create device with COLOR Channel #CWWW feature', () => {
  const tasmota = new TasmotaHandler(gladys, serviceId);
  const tasmotaHandler = tasmota.protocols.mqtt;
  tasmotaHandler.mqttService = mqttService;

  beforeEach(() => {
    sinon.reset();
  });

  it('decode STATUS message', () => {
    tasmotaHandler.handleMessage('stat/tasmota-device-topic/STATUS', JSON.stringify(messages.STATUS));

    expect(tasmotaHandler.discoveredDevices).to.deep.eq({});
    expect(tasmotaHandler.pendingDevices).to.deep.eq({
      'tasmota-device-topic': {
        name: 'Tasmota',
        params: [
          {
            name: 'protocol',
            value: 'mqtt',
          },
        ],
        model: 13,
        external_id: 'tasmota:tasmota-device-topic',
        selector: 'tasmota-tasmota-device-topic',
        service_id: serviceId,
        should_poll: false,
        features: [],
      },
    });

    assert.notCalled(gladys.event.emit);
    assert.notCalled(gladys.stateManager.get);
    assert.calledWith(mqttService.device.publish, 'cmnd/tasmota-device-topic/STATUS', '11');
  });

  it('decode STATUS11 message', () => {
    tasmotaHandler.handleMessage('stat/tasmota-device-topic/STATUS11', JSON.stringify(messages.STATUS11));

    expect(tasmotaHandler.discoveredDevices).to.deep.eq({});
    expect(tasmotaHandler.pendingDevices).to.deep.eq({
      'tasmota-device-topic': {
        name: 'Tasmota',
        params: [
          {
            name: 'protocol',
            value: 'mqtt',
          },
        ],
        model: 13,
        external_id: 'tasmota:tasmota-device-topic',
        selector: 'tasmota-tasmota-device-topic',
        service_id: serviceId,
        should_poll: false,
        features: [],
      },
    });

    assert.notCalled(gladys.event.emit);
    assert.notCalled(gladys.stateManager.get);
    assert.calledWith(mqttService.device.publish, 'cmnd/tasmota-device-topic/STATUS', '8');
  });

  it('decode STATUS8 message', () => {
    tasmotaHandler.handleMessage('stat/tasmota-device-topic/STATUS8', JSON.stringify(messages.STATUS8));

    const expectedDevice = {
      name: 'Tasmota',
      params: [
        {
          name: 'protocol',
          value: 'mqtt',
        },
      ],
      model: 13,
      external_id: 'tasmota:tasmota-device-topic',
      selector: 'tasmota-tasmota-device-topic',
      service_id: serviceId,
      should_poll: false,
      features: [],
    };
    expect(tasmotaHandler.discoveredDevices).to.deep.eq({
      'tasmota-device-topic': expectedDevice,
    });
    expect(tasmotaHandler.pendingDevices).to.deep.eq({});

    assert.notCalled(mqttService.device.publish);
    assert.calledWith(gladys.stateManager.get, 'deviceByExternalId', 'tasmota:tasmota-device-topic');
    assert.calledWith(gladys.event.emit, EVENTS.WEBSOCKET.SEND_ALL, {
      type: WEBSOCKET_MESSAGE_TYPES.TASMOTA.NEW_MQTT_DEVICE,
      payload: expectedDevice,
    });
  });
});
