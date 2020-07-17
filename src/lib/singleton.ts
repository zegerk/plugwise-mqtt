/**
 * Singleton factory class in order to avoid duplicate
 * code - tried to fix this using generic typed classes
 * but they do not work on static classes
 */
export default class Singleton {
  private static instances: {[index: string]: any}

  /**
   * @param {T} Ctor
   * @return {T}
   */
  static getInstance<T>(Ctor: {new (): T}) {
    if (!Singleton.instances[typeof Ctor]) {
      Singleton.instances[typeof Ctor] = new Ctor()
    }

    return Singleton.instances[typeof Ctor]
  }
}
