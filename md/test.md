egg-role
---
> egg 角色控制插件

[![Build Status](https://www.travis-ci.org/lakca/egg-role.svg?branch=master)](https://www.travis-ci.org/lakca/egg-role)
[![codecov](https://codecov.io/gh/lakca/egg-role/branch/master/graph/badge.svg)](https://codecov.io/gh/lakca/egg-role)

特点：
---
- 所有访问控制均基于配置文件。
- 根据应用自身提供的[ctx.getRoles](./test/fixtures/apps/default/app/extend/context.js)函数获取当前用户的角色，插件本身不提供角色管理的功能。
- 可以控制[router](https://eggjs.org/zh-cn/basics/router.html), [service](https://eggjs.org/zh-cn/basics/router.html)等的访问。
- 基于[egg-i18n](https://eggjs.org/zh-cn/core/i18n.html)的自定义访问错误信息。

配置示例：
---
```js
function test() {
  console.log('Hello');
}

exports.role = {
  policy: {
    'user_admin': [ // role is 'user_admin'
      'router:updateUser', // the role can access router which name is 'updateUser'
      'controller:user.listUsers' // the role can access controller which name is 'user.listUsers' ignoring what the router is.
    ],
    'comment_inspector': [
      'router:denyComment',
      'router:stickComment',
      'controller:comment.listComments'
    ]
  }
};
```
[默认配置](./config/config.default.js)