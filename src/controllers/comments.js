import Comment from '../models/comment'

import {
  ForbiddenError,
  UnauthorizedError,
  NotFoundError,
  MissingParameterError,
  BadRequestError
} from '../lib/errors'

import { initStorage } from '../lib/helpers'

export default app => {
  const store = initStorage(app)({
    comments: {
      map: true,
      parse: text => new Comment(text),
      stringify: o => JSON.stringify(o)
    },
    commentsMapSize: null,

    commentsSheetMap: { map: true },
    commentsUserMap: { map: true }
  })

  const init = () => {
    store.commentsMapSize = 0
  }

  const _update = (id, opts, force = false) => {
    if (id && typeof id !== 'number') throw BadRequestError()
    if (opts.created) throw ForbiddenError()

    const commentId = typeof id !== 'undefined' ? id : store.commentsMapSize
    const author = app.from
    const now = Date.now()

    const obj = store.comments.get(commentId)

    if (!force && obj && (obj.author !== author || obj.isRemoved)) {
      throw UnauthorizedError()
    }

    const update = {
      updated: now,
      author,
      comment: opts.comment,
      isRemoved: opts.isRemoved,
      id: commentId
    }

    store.comments.put(commentId, {
      ...(obj || { created: now }),
      ...update
    })

    if (!obj) store.commentsMapSize += 1

    return commentId
  }

  const _getComment = id => {
    const comment = store.comments.get(id)
    const {
      username,
      avatar,
      isRemoved,
      isBanned
    } = app.users.store.users.get(comment.author)

    if (isBanned) return null

    return {
      ...comment,
      author: { username, avatar, isRemoved }
    }
  }

  const postComment = (slug, comment) => {
    if (!slug) throw MissingParameterError('slug')
    if (!comment) throw MissingParameterError('comment')

    const sheetId = app.sheets.getIdBySlug(slug)
    if (!sheetId) {
      throw NotFoundError(`'${slug}' does not exist.`)
    }

    const commentId = _update(undefined, { comment })
    const curr = store.commentsSheetMap.get(sheetId) || []

    const author = app.from
    const userComments = store.commentsUserMap.get(author) || []
    store.commentsUserMap.put(author, [...userComments, commentId])
    store.commentsSheetMap.put(sheetId, [...curr, commentId])

    return commentId
  }

  const updateComment = (id, opts) => {
    const force = app.user.roles && app.user.roles.find(r => r === 'moderator')
    _update(id, opts, force)
  }

  const removeComment = id => updateComment(id, { isRemoved: true })

  const getComments = ({ slug, username } = {}) => {
    if (!slug && !username) throw MissingParameterError('opts ({ slug?, username? })')

    const userId = username && app.users.store.usernameMap.get(username)
    if (username && !userId) throw NotFoundError()

    const sheetId = slug && app.sheets.getIdBySlug(slug)
    if (slug && !sheetId) throw NotFoundError()

    const idList = slug
      ? store.commentsSheetMap.get(sheetId) || []
      : store.commentsUserMap.get(userId) || []

    return idList
      .map(_getComment)
      .filter(c => c && !c.isRemoved)
  }

  return {
    init,
    store,
    postComment,
    removeComment,
    updateComment,
    getComments
  }
}
