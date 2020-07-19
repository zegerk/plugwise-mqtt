import {logger} from './logger'

/**
 * Singleton factory class in order to avoid duplicate
 * code - tried to fix this using generic typed classes
 * but they do not work on static classes
 */
export default class Singleton {
  private static instances: {[index: string]: any} = {}

  /**
   * @param {T} Ctor
   * @return {T}
   */
  static getInstance<T>(Ctor: {new (): T}) {
    const className = Ctor.name
    if (!Singleton.instances[className]) {
      logger.debug('Instantiating ' + className)
      Singleton.instances[className] = new Ctor()
    }

    return Singleton.instances[className]
  }
}
