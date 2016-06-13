const async = require('async'),
  _ = require('lodash')

const ProblemsCtrl = require('./problems'),
  Contest = require('../models/contest')

exports.getData = (req, res) => {
  let id = req.params.id
  Contest.findById(id).populate({
    path: 'contestants.team',
    select: '_id name'
  }).populate({
    path: 'problems',
    select: '_id name'
  }).then((contest) => {
    console.log('oi')
    if (!contest) {
      return res.status(400).send()
    }

    let userId = req.user && req.user._id
    let obj = {
      name: contest.name,
      date_start: contest.date_start,
      date_end: contest.date_end,
      frozen_time: contest.frozen_time,
      blind_time: contest.blind_time,
      isPrivate: contest.isPrivate,
      watchPrivate: contest.watchPrivate,
      contestantType: contest.contestantType,
      problems: [],

      inContest: contest.userInContest(userId)
    }

    let canViewContestants =
      (userId === contest.author || contest.userInContest(userId) || !contest.isPrivate)
    let canViewProblems = contest.date_start >= new Date() && canViewContestants

    let isAdmin = req.user && req.user.isAdmin
    if (isAdmin || canViewContestants) obj.contestants = contest.contestants
    if (isAdmin || canViewProblems) obj.problems = contest.problems

    return res.json(obj)
  })
}

// exports.getFullData = function (req, res, next) {
//   Contest.findById(req.params.id)
//     .populate('problems')
//     .lean()
//     .exec()
//     .then(function (contest) {
//       try {
//         if (!contest) {
//           return res.status(400).send()
//         }
//         if (contest.date_end <= new Date()) {
//           return res.status(400).send()
//         }
//         if (contest.author.toString() !== req.user._id.toString()) {
//           return res.status(400).send()
//         }
//         contest.problems = _.map(contest.problems, ProblemsCtrl.remapProblem)
//         return res.json({
//           contest: contest
//         })
//       } catch (err) {
//         return res.json({
//           error: err
//         })
//       }
//     }, function (err) {
//       return res.json({
//         error: err
//       })
//     })
// }
//
// exports.remove = function (req, res, next) {
//   var id = req.params.id
//   Contest.findById(id).exec()
//     .then(function (contest) {
//       if (!contest) {
//         return res.status(400).send()
//       }
//       if (contest.author.toString() != req.user._id.toString()) {
//         return res.status(400).send()
//       }
//       contest.remove(function (err) {
//         if (err) {
//           return res.json({
//             error: err
//           })
//         }
//         return res.json({})
//       })
//     }, function (err) {
//       return res.json({
//         error: err
//       })
//     })
// }
//
// exports.join = function (req, res, next) {
//   var data = req.body
//   Contest.findById(data.id).exec()
//     .then(function (contest) {
//       try {
//         if (new Date(contest.date_end) <= new Date()) {
//           return res.status(400).send()
//         }
//         if (contest.isPrivate && contest.password != data.password) {
//           return res.json({
//             error: 'Senha inválida.'
//           })
//         }
//         if ((data.team === '0' && contest.contestantType === 2) ||
//           (data.team !== '0' && contest.contestantType === 1)) {
//           return res.status(400).send()
//         }
//         if (contest.userInContest(req.user._id)) {
//           return res.status(400).send()
//         }
//         if (data.team !== '0' && !ObjectId.isValid(data.team)) {
//           return res.status(400).send()
//         }
//         var props = {
//           id: req.user._id,
//           isIndividual: (data.team === '0')
//         }
//         if (data.team !== '0') {
//           props.team = new ObjectId(data.team)
//         }
//       } catch (err) {
//         console.log(err)
//         return res.json({
//           error: err
//         })
//       }
//
//       contest.contestants.push(props)
//       contest.save(function (err) {
//         if (err) {
//           return res.json({
//             error: err
//           })
//         }
//         return res.json({})
//       })
//     })
// }
//
// exports.leave = function (req, res, next) {
//   var data = req.body
//   Contest.findById(data.id).exec()
//     .then(function (contest) {
//       try {
//         if (new Date(contest.date_start) <= new Date()) {
//           return res.status(400).send()
//         }
//         if (!contest.userInContest(req.user._id)) {
//           return res.status(400).send()
//         }
//         contest.contestants = _.filter(contest.contestants, function (obj) {
//           return obj.id && obj.id.toString() != req.user._id.toString()
//         })
//         contest.save(function (err) {
//           if (err) {
//             return res.json({
//               error: err
//             })
//           }
//           return res.json({})
//         })
//       } catch (err) {
//         console.log(err)
//         return res.json({
//           error: err
//         })
//       }
//     })
// }
//
// function getMinutesBetweenDates (startDate, endDate) {
//   return Math.floor((endDate - startDate) / 60000)
// }
//
// exports.prevalidation = function (req, res, next) {
//   var contest = req.body
//   contest.problems = _.uniq(contest.problems, false, function (obj) {
//     return obj.id
//   })
//   // TODO array de problemas tem que ser unico e válido
//   contest.problems = _.map(contest.problems, function (problem) {
//     return ObjectId(problem.id)
//   })
//   try {
//     contest.startDateTime = new Date(contest.startDateTime)
//     contest.endDateTime = new Date(contest.endDateTime)
//     contest.frozenDateTime = new Date(contest.frozenDateTime)
//     contest.blindDateTime = new Date(contest.blindDateTime)
//     if (!contest.startDateTime || !contest.endDateTime || !contest.frozenDateTime || !contest.blindDateTime) {
//       throw new Error('Formato inválido de data.')
//       return res.status(400).send()
//     }
//     contest.duration = getMinutesBetweenDates(contest.startDateTime, contest.endDateTime)
//     contest.frozenDuration = getMinutesBetweenDates(contest.frozenDateTime, contest.endDateTime)
//     contest.blindDuration = getMinutesBetweenDates(contest.blindDateTime, contest.endDateTime)
//     if (!contest.name || contest.name.length === 0) {
//       return res.status(400).send()
//     }
//     if (contest.name.length > 30) {
//       return res.status(400).send()
//     }
//     if (contest.descr && contest.descr.length > 500) {
//       return res.status(400).send()
//     }
//     if (!contest.startDateTime || !contest.endDateTime) {
//       return res.status(400).send()
//     }
//     if (contest.duration < 10) {
//       return res.status(400).send()
//     }
//     if (contest.duration > 365 * 24 * 60) {
//       return res.status(400).send()
//     }
//     if (contest.frozenDuration > contest.duration) {
//       return res.status(400).send()
//     }
//     if (contest.blindDuration > contest.frozenDuration) {
//       return res.status(400).send()
//     }
//     if (!contest.problems || !contest.problems.length) {
//       return res.status(400).send()
//     }
//     if (contest.problems.length > 26) {
//       return res.status(400).send()
//     }
//     // TODO check if problems are valid
//     if (contest.password != contest.confirmPassword) {
//       return res.status(400).send()
//     }
//     contest.contestantType = Number(contest.contestantType)
//     if (!contest.contestantType || contest.contestantType < 1 || contest.contestantType > 3) {
//       return res.status(400).send()
//     }
//     contest.watchPrivate = Number(contest.watchPrivate)
//     if (contest.watchPrivate != 0 && contest.watchPrivate != 1) {
//       return res.status(400).send()
//     }
//     return next()
//   } catch (err) {
//     console.log(err)
//     return res.status(400).send()
//   }
// }
//
// exports.edit = function (req, res, next) {
//   var editContest = req.body
//
//   Contest.findById(editContest.id).exec().then(function (contest) {
//     try {
//       if (!contest) {
//         return res.status(400).send()
//       }
//       if (contest.date_end <= new Date()) {
//         return res.status(400).send()
//       }
//       if (contest.author.toString() !== req.user._id.toString()) {
//         return res.status(400).send()
//       }
//       if (contest.date_start - editContest.startDateTime !== 0 && editContest.startDateTime <= new Date()) {
//         return res.json({
//           error: 'A nova data de início deve ocorrer no futuro (o horário do servidor é ' + new Date() + ')'
//         })
//       }
//       if (contest.date_start <= new Date()) {
//         if (contest.date_start - editContest.startDateTime !== 0) {
//           return res.status(400).send()
//         }
//         if (contest.problems.length != editContest.problems.length) {
//           return res.status(400).send()
//         }
//         for (var i = 0; i < contest.problems.length; i++) {
//           if (contest.problems[i].toString() !== editContest.problems[i].toString()) {
//             return res.status(400).send()
//           }
//         }
//       }
//
//       contest.name = editContest.name
//       contest.description = editContest.descr
//       contest.date_start = editContest.startDateTime
//       contest.date_end = editContest.endDateTime
//       contest.frozen_time = editContest.frozenDateTime
//       contest.blind_time = editContest.blindDateTime
//       contest.problems = editContest.problems
//       contest.contestantType = editContest.contestantType
//       contest.password = editContest.password
//       contest.isPrivate = (editContest.password.length > 0)
//       contest.watchPrivate = (editContest.watchPrivate == 1)
//
//       contest.save(function (err, data) {
//         if (err) {
//           return res.json({
//             error: err
//           })
//         }
//         return res.json(data)
//       })
//     } catch (err) {
//       console.log(err)
//       return res.json({
//         error: err
//       })
//     }
//   })
// }
//
// var isInContest = function (id, contest) {
//   if (!id) return false
//   var index = _.findIndex(contest.contestants, function (obj) {
//     return obj.id && obj.id._id.toString() == id.toString()
//   })
//   if (index != -1) return true
//   return false
// }
//
// exports.getScoreboard = function (req, res, next) {
//   var id = req.params.id
//   Contest.findById(id)
//     .populate({
//       path: 'contestants.team',
//       select: '_id name'
//     })
//     .populate({
//       path: 'contestants.id',
//       select: '_id local.username'
//     })
//     .populate({
//       path: 'problems',
//       select: '_id url name'
//     })
//     .lean()
//     .exec()
//     .then(function (contest) {
//       if (contest.watchPrivate && (!req.user || (contest.author.toString() !== req.user._id.toString() && !isInContest(req.user._id, contest)))) {
//         return res.status(400).send()
//       }
//       var nonNullContestants = _.filter(contest.contestants, function (obj) {
//         return obj.id
//       })
//       var contestants =
//       _.map(nonNullContestants, function (obj) {
//         if (obj.team) return [obj.team._id, {
//             type: 'team',
//             name: obj.team.name
//           }]
//         else return [obj.id._id, {
//             type: 'user',
//             name: obj.id.local.username
//           }]
//       })
//       contestants = _.reduce(contestants, (obj, elem) => {
//         obj[elem[0]] = elem[1]
//       }, {})
//       var userToContestant =
//       _.map(nonNullContestants, function (obj) {
//         var toId = null
//         if (obj.team) toId = obj.team._id
//         else toId = obj.id._id
//         return [obj.id._id, toId]
//       })
//       userToContestant = _.reduce(userToContestant, (obj, elem) => {
//         obj[elem[0]] = elem[1]
//       }, {})
//       var userId = (req.user && req.user._id) || null
//       SubmissionCtrl.getScoresAndSubmissions(contest, userId, userToContestant, function (data) {
//         return res.json({
//           contestants: contestants,
//           scores: data.scores,
//           upsolvingScores: data.upsolvingScores,
//           submissions: data.submissions,
//           problems: contest.problems,
//           start: contest.date_start,
//           end: contest.date_end,
//           blind: contest.blind_time,
//           frozen: contest.frozen_time,
//           name: contest.name,
//           inContest: isInContest(userId, contest),
//           contestantId: (userId && userToContestant[userId]) || null
//         })
//       })
//     })
// }
//
// exports.getDynamicScoreboard = function (req, res, next) {
//   var id = req.params.id
//   Contest.findById(id)
//     .populate({
//       path: 'contestants.team',
//       select: '_id name'
//     })
//     .populate({
//       path: 'contestants.id',
//       select: '_id local.username'
//     })
//     .populate({
//       path: 'problems',
//       select: '_id url'
//     })
//     .lean()
//     .exec()
//     .then(function (contest) {
//       if (contest.watchPrivate && (!req.user || (contest.author.toString() !== req.user._id.toString() && !isInContest(req.user._id, contest)))) {
//         return res.status(400).send()
//       }
//       if (new Date(contest.date_end) > new Date()) {
//         return res.status(400).send()
//       }
//       var contestants =
//       _.map(contest.contestants, function (obj) {
//         if (obj.team) return [obj.team._id, {
//             type: 'team',
//             name: obj.team.name
//           }]
//         else return [obj.id._id, {
//             type: 'user',
//             name: obj.id.local.username
//           }]
//       })
//       contestants = _.reduce(contestants, (obj, elem) => {
//         obj[elem[0]] = elem[1]
//       }, {})
//
//       var userToContestant =
//       _.map(contest.contestants, function (obj) {
//         var toId = null
//         if (obj.team) toId = obj.team._id
//         else toId = obj.id._id
//         return [obj.id._id, toId]
//       })
//       userToContestant = _.reduce(userToContestant, (obj, elem) => {
//         obj[elem[0]] = elem[1]
//       }, {})
//
//       SubmissionCtrl.getAllContestSubmissions(contest, userToContestant, function (data) {
//         return res.json({
//           submissions: data.submissions
//         })
//       })
//     })
// }
