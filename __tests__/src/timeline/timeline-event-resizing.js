import TimelineViewWrapper from "../lib/wrappers/TimelineViewWrapper"
import ResourceTimelineViewWrapper from '../lib/wrappers/ResourceTimelineViewWrapper'

// TODO: do resizing from the start
// TODO: more tests when slotDuration=1week, no event end. resize behavior?

describe('timeline event resizing', function() {
  pushOptions({
    now: '2015-11-28',
    scrollTime: '00:00',
    editable: true,
    resources: [
      { id: 'a', title: 'Resource A' },
      { id: 'b', title: 'Resource B' }
    ]
  })

  describeOptions('dir', {
    'LTR': 'ltr',
    'RTL': 'rtl'
  }, function(dir) {

    describeTimeZones(function(tz) {

      describe('when time scale', function() {
        pushOptions({
          defaultView: 'resourceTimelineDay'
        })

        describe('when snap matches slots', function() {

          describe('when no resources', function() {
            pushOptions({
              defaultView: 'timelineDay'
            })

            it('reports resize with no resource', function(done) {
              let resizeSpy
              let calendar = initCalendar({
                events: [
                  { title: 'event1', className: 'event1', start: '2015-11-28T04:00:00', end: '2015-11-28T05:00:00' }
                ],
                eventResize:
                  (resizeSpy = spyCall(function(arg) {
                    expect(arg.event.start).toEqualDate(tz.parseDate('2015-11-28T04:00:00'))
                    expect(arg.event.end).toEqualDate(tz.parseDate('2015-11-28T07:30:00'))

                    let resources = arg.event.getResources()
                    expect(resources.length).toBe(0)
                  }))
              })

              let timelineGridWrapper = new TimelineViewWrapper(calendar).timelineGrid

              $('.event1').simulate('mouseover') // resizer only shows on hover
              $('.event1 .fc-end-resizer')
                .simulate('drag', {
                  end: timelineGridWrapper.getSlatElByDate('2015-11-28T07:00:00'),
                  callback() {
                    expect(resizeSpy).toHaveBeenCalled()
                    expect(isAnyHighlight()).toBe(false) // TODO: move to its own test
                    done()
                  }
                })
            })
          })

          describe('when resources', function() {

            it('reports resize on a resource', function(done) {
              let resizeSpy
              let calendar = initCalendar({
                events: [
                  { title: 'event1', className: 'event1', start: '2015-11-28T04:00:00', end: '2015-11-28T05:00:00', resourceId: 'b' }
                ],
                eventResize:
                  (resizeSpy = spyCall(function(arg) {
                    expect(arg.event.start).toEqualDate(tz.parseDate('2015-11-28T04:00:00'))
                    expect(arg.event.end).toEqualDate(tz.parseDate('2015-11-28T07:30:00'))

                    let resources = arg.event.getResources()
                    expect(resources.length).toBe(1)
                    expect(resources[0].id).toBe('b')
                  }))
              })

              let timelineGridWrapper = new ResourceTimelineViewWrapper(calendar).timelineGrid

              $('.event1').simulate('mouseover') // resizer only shows on hover
              $('.event1 .fc-end-resizer')
                .simulate('drag', {
                  end: timelineGridWrapper.getPoint('b', '2015-11-28T07:00:00'),
                  callback() {
                    expect(resizeSpy).toHaveBeenCalled()
                    expect(isAnyHighlight()).toBe(false) // TODO: move to its own test
                    done()
                  }
                })
            })

            it('reports resize across resources', function(done) {
              let resizeSpy
              let calendar = initCalendar({
                events: [
                  { title: 'event1', className: 'event1', start: '2015-11-28T04:00:00', end: '2015-11-28T05:00:00', resourceId: 'b' }
                ],
                eventResize:
                  (resizeSpy = spyCall(function(arg) {
                    expect(arg.event.start).toEqualDate(tz.parseDate('2015-11-28T04:00:00'))
                    expect(arg.event.end).toEqualDate(tz.parseDate('2015-11-28T07:30:00'))

                    let resources = arg.event.getResources()
                    expect(resources.length).toBe(1)
                    expect(resources[0].id).toBe('b')
                  }))
              })

              let timelineGridWrapper = new ResourceTimelineViewWrapper(calendar).timelineGrid

              $('.event1').simulate('mouseover') // resizer only shows on hover
              $('.event1 .fc-end-resizer')
                .simulate('drag', {
                  end: timelineGridWrapper.getPoint('a', '2015-11-28T07:00:00'),
                  callback() {
                    expect(resizeSpy).toHaveBeenCalled()
                    done()
                  }
                })
            })

            it('reports resize on one event of multiple resources', function(done) {
              let resizeSpy
              let calendar = initCalendar({
                events: [
                  { title: 'event1', className: 'event1', start: '2015-11-28T04:00:00', end: '2015-11-28T05:00:00', resourceIds: [ 'a', 'b' ] }
                ],
                eventResize:
                  (resizeSpy = spyCall(function(arg) {
                    expect(arg.event.start).toEqualDate(tz.parseDate('2015-11-28T04:00:00'))
                    expect(arg.event.end).toEqualDate(tz.parseDate('2015-11-28T07:30:00'))

                    let resourceIds = arg.event.getResources().map((resource) => resource.id)
                    resourceIds.sort()
                    expect(resourceIds).toEqual([ 'a', 'b' ])
                  }))
              })

              let timelineGridWrapper = new ResourceTimelineViewWrapper(calendar).timelineGrid

              $('.event1:first').simulate('mouseover') // resizer only shows on hover
              $('.event1:first .fc-end-resizer')
                .simulate('drag', {
                  end: timelineGridWrapper.getPoint('a', '2015-11-28T07:00:00'),
                  callback() {
                    expect(resizeSpy).toHaveBeenCalled()
                    done()
                  }
                })
            })
          })
        })

        describe('when snap smaller than slots', function() {
          pushOptions({
            slotDuration: '00:30',
            snapDuration: '00:15'
          })

          it('reports a smaller granularity', function(done) {
            let resizeSpy
            let calendar = initCalendar({
              events: [
                { title: 'event1', className: 'event1', start: '2015-11-28T04:00:00', end: '2015-11-28T05:00:00', resourceId: 'b' }
              ],
              eventResize:
                (resizeSpy = spyCall(function(arg) {
                  expect(arg.event.start).toEqualDate(tz.parseDate('2015-11-28T04:00:00'))
                  expect(arg.event.end).toEqualDate(tz.parseDate('2015-11-28T07:45:00'))

                  let resources = arg.event.getResources()
                  expect(resources.length).toBe(1)
                  expect(resources[0].id).toBe('b')
                }))
            })

            let timelineGridWrapper = new ResourceTimelineViewWrapper(calendar).timelineGrid

            $('.event1').simulate('mouseover') // resizer only shows on hover
            $('.event1 .fc-end-resizer')
              .simulate('drag', {
                end: timelineGridWrapper.getPoint('b', '2015-11-28T07:30:00'),
                callback() {
                  expect(resizeSpy).toHaveBeenCalled()
                  done()
                }
              })
          })
        })
      })
    })

    it('works with touch', function(done) {
      let resizeSpy
      let calendar = initCalendar({
        isTouch: true,
        longPressDelay: 100,
        defaultView: 'resourceTimelineDay',
        events: [
          { title: 'event1', className: 'event1', start: '2015-11-28T04:00:00', end: '2015-11-28T05:00:00', resourceId: 'b' }
        ],
        eventResize:
          (resizeSpy = spyCall(function(arg) {
            expect(arg.event.start).toEqualDate('2015-11-28T04:00:00Z')
            expect(arg.event.end).toEqualDate('2015-11-28T07:30:00Z')

            let resources = arg.event.getResources()
            expect(resources.length).toBe(1)
            expect(resources[0].id).toBe('b')
          }))
      })

      let timelineGridWrapper = new ResourceTimelineViewWrapper(calendar).timelineGrid

      $('.event1').simulate('drag', {
        isTouch: true,
        delay: 200,
        callback() {
          $('.event1').simulate('mouseover') // resizer only shows on hover
          $('.event1 .fc-end-resizer').simulate('drag', {
            // hack to make resize start within the bounds of the event
            localPoint: { top: '50%', left: (dir === 'rtl' ? '100%' : '0%') },
            isTouch: true,
            end: timelineGridWrapper.getPoint('b', '2015-11-28T07:00:00'),
            callback() {
              setTimeout(function() { // for next test. won't ignore mousedown
                expect(resizeSpy).toHaveBeenCalled()
                done()
              }, 500)
            }
          })
        }
      })
    })

    describe('when day scale', function() {
      pushOptions({
        defaultView: 'resourceTimelineMonth',
        slotDuration: { days: 1 }
      })

      it('reports untimed dates', function(done) {
        let resizeSpy
        let calendar = initCalendar({
          events: [
            { title: 'event1', className: 'event1', start: '2015-11-03', resourceId: 'a' }
          ],
          eventResize:
            (resizeSpy = spyCall(function(arg) {
              expect(arg.event.start).toEqualDate('2015-11-03')
              expect(arg.event.end).toEqualDate('2015-11-06')

              let resources = arg.event.getResources()
              expect(resources.length).toBe(1)
              expect(resources[0].id).toBe('a')
            }))
        })

        let timelineGridWrapper = new ResourceTimelineViewWrapper(calendar).timelineGrid

        $('.event1').simulate('mouseover') // resizer only shows on hover
        $('.event1 .fc-end-resizer')
          .simulate('drag', {
            end: timelineGridWrapper.getPoint('a', '2015-11-05'),
            callback() {
              expect(resizeSpy).toHaveBeenCalled()
              done()
            }
          })
      })
    })

    describe('when week scale', function() {
      pushOptions({
        defaultView: 'resourceTimelineYear',
        slotDuration: { weeks: 1 },
        slotWidth: 50
      })

      it('reports untimed dates', function(done) { // TODO: this is desired behavior when no end???
        let resizeSpy
        let calendar = initCalendar({
          events: [
            { title: 'event1', className: 'event1', start: '2015-01-18', end: '2015-01-25', resourceId: 'a' }
          ],
          eventResize:
            (resizeSpy = spyCall(function(arg) {
              expect(arg.event.start).toEqualDate('2015-01-18')
              expect(arg.event.end).toEqualDate('2015-02-15')

              let resources = arg.event.getResources()
              expect(resources.length).toBe(1)
              expect(resources[0].id).toBe('a')
            }))
        })

        let timelineGridWrapper = new ResourceTimelineViewWrapper(calendar).timelineGrid

        $('.event1').simulate('mouseover') // resizer only shows on hover
        $('.event1 .fc-end-resizer')
          .simulate('drag', {
            end: timelineGridWrapper.getPoint('a', '2015-02-08'),
            callback() {
              expect(resizeSpy).toHaveBeenCalled()
              done()
            }
          })
      })
    })
  })

  describe('mirror', function() {

    it('gets passed into eventRender/eventDestroy', function(done) {
      let mirrorRenderCalls = 0
      let mirrorDestroyCalls = 0
      let normalRenderCalls = 0
      let normalDestroyCalls = 0
      let calendar = initCalendar({
        defaultView: 'resourceTimelineDay',
        eventDragMinDistance: 0, // so mirror will render immediately upon mousedown
        slotDuration: '01:00',
        snapDuration: '01:00',
        events: [
          { start: '2015-11-28T01:00:00', end: '2015-11-28T02:00:00', resourceId: 'a' }
        ],
        eventRender(info) {
          if (info.isMirror) {
            mirrorRenderCalls++
          } else {
            normalRenderCalls++
          }
        },
        eventDestroy(info) {
          if (info.isMirror) {
            mirrorDestroyCalls++
          } else {
            normalDestroyCalls++
          }
        }
      })

      // move two slots
      let timelineGridWrapper = new ResourceTimelineViewWrapper(calendar).timelineGrid
      let endPoint = timelineGridWrapper.getPoint('a', '2015-11-28T04:00:00')
      endPoint.left -= 5

      $('.fc-event').simulate('mouseover') // resizer only shows on hover
      $('.fc-event .fc-end-resizer')
        .simulate('drag', {
          end: endPoint,
          callback() {
            expect(mirrorRenderCalls).toBe(3)
            expect(mirrorDestroyCalls).toBe(3)

            expect(normalRenderCalls).toBe(2)
            expect(normalDestroyCalls).toBe(1)

            done()
          }
        })
    })
  })


  function isAnyHighlight() {
    return $('.fc-highlight').length > 0
  }

})
