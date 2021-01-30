/* eslint-disable node/no-unpublished-import */
import { Controller } from 'egg'

import { pluginName } from '../../../../../dist/lib/config'


export default class HomeController extends Controller {

  index(): void {
    this.ctx.body = 'hi, ' + this.app.plugins[pluginName].name
  }

  ping(): void {
    this.ctx.body = 'hi, ' + this.app.plugins[pluginName].name
  }

}

