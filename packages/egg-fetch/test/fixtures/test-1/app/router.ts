/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Application } from 'egg'


export default (app: Application): void => {

  const { router, controller } = app

  router.get('/', controller.home.index)
  router.get('/ping', controller.home.ping)
}

