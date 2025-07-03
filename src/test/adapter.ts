import type { DataMapper } from '@nova-odm/mapper'

export default class DynamoDBAdapter {
  private dataMapper: DataMapper

  constructor(dataMapper: DataMapper) {
    this.dataMapper = dataMapper
  }

  // @ts-expect-error no-implicit-any
  build(Model, props) {
    const model = new Model()
    for (const [key, value] of Object.entries(props)) {
      model[key] = value
    }
    return model
  }
  // @ts-expect-error no-implicit-any
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async save(model, Model) {
    return await this.dataMapper.put(model)
  }
  // @ts-expect-error no-implicit-any
  async destroy(model, _Model) {
    return this.dataMapper.delete(model)
  }

  // @ts-expect-error no-implicit-any
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  get(model, attr, Model) {
    return model.get(attr)
  }

  // @ts-expect-error no-implicit-any
  set(props, model, _Model) {
    console.log('SET', _Model, props)
    Object.keys(props).forEach((key) => {
      model[key] = props[key]
    })
    return model
  }
}

export class ObjectAdapter {
  // @ts-expect-error no-implicit-any
  build(Model, props) {
    const model = new Model()
    this.set(props, model, Model)
    return model
  }
  // @ts-expect-error no-implicit-any
  // eslint-disable-next-line @typescript-eslint/require-await, @typescript-eslint/no-unused-vars
  async save(model, Model) {
    return model
  }
  // @ts-expect-error no-implicit-any
  // eslint-disable-next-line @typescript-eslint/require-await, @typescript-eslint/no-unused-vars
  async destroy(model, Model) {
    return model
  }
  // @ts-expect-error no-implicit-any
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  get(model, attr, Model) {
    return model[attr]
  }
  // @ts-expect-error no-implicit-any
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  set(props, model, Model) {
    return Object.assign(model, props)
  }
}
