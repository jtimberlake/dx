import React, { useState, useEffect, useContext, useMemo } from 'react';
import Skeleton from 'react-loading-skeleton';
import { isSameDay, format } from 'date-fns';
import VisuallyHidden from '@reach/visually-hidden';
import { useCourseSchedule, getPlannerItems } from '../api/student';
import { useAcademicCalendarEvents } from '../api/events';
import { UserContext } from '../App';
import { getNextFiveDays, getDayShortcode, coursesOnDay } from './schedule/schedule-utils';
import {
  ScheduleCardDayMenu,
  ScheduleCardCourses,
  ScheduleCardAssignments,
  ScheduleCardAcademicCalendar
} from './schedule';
import { Header } from './schedule/ScheduleCardStyles';
import { Card, CardFooter, CardContent } from '../ui/Card';

/**
 * Course Schedule Card
 *
 * Displays courses for the next 5 days, filterable by day.
 */
const ScheduleCard = () => {
  const nextFiveDays = getNextFiveDays();
  const courses = useCourseSchedule({
    callback: data => {
      return data.filter(c =>
        c.attributes.meetingTimes.find(t => t.beginDate && Date.parse(t.beginDate) <= Date.now())
      );
    }
  });
  const [selectedDay, setSelectedDay] = useState(nextFiveDays[0]);
  const [plannerItems, setPlannerItems] = useState<any[]>([]);
  const [plannerItemsLoading, setPlannerItemsLoading] = useState<boolean>(true);
  const calEvents = useAcademicCalendarEvents();
  const user = useContext<any>(UserContext);
  const getCoursesOnSelectedDay = () => {
    const selectedDayShortcode = getDayShortcode(selectedDay);
    return coursesOnDay(courses.data, selectedDayShortcode);
  };

  // Get courses and assignments matching selected day.
  const selectedCourses = getCoursesOnSelectedDay();

  let selectedPlannerItems: any[] = [];
  if (user.isCanvasOptIn) {
    selectedPlannerItems = plannerItems.filter(item =>
      item.plannable.due_at ? isSameDay(item.plannable.due_at, selectedDay) : ''
    );
  }

  const selectedCalEvents = calEvents.data.filter(event =>
    event.pubDate ? isSameDay(event.pubDate, selectedDay) : ''
  );

  // Populate user courses
  useEffect(() => {
    let isMounted = true;

    getPlannerItems()
      .then(data => {
        if (isMounted) {
          setPlannerItems(data);
          setPlannerItemsLoading(false);
        }
      })
      .catch(err => {
        setPlannerItemsLoading(false);
        console.log(err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Get a list of days with courses or assignments.
  // Used to display the orange dots above days to indicate
  // which days have events at a quick glance.
  const daysWithEvents = useMemo(
    () =>
      nextFiveDays.filter(day => {
        const dayShortcode = getDayShortcode(day);
        const hasCourses = coursesOnDay(courses.data, dayShortcode).length > 0;
        const calendarEventsOnDay = calEvents.data.filter(event =>
          event.pubDate ? isSameDay(event.pubDate, day) : ''
        );

        let plannerItemsOnDay: any[] = [];
        if (user.isCanvasOptIn) {
          plannerItemsOnDay = plannerItems.filter(item =>
            item.plannable.due_at ? isSameDay(item.plannable.due_at, day) : ''
          );
        }

        return hasCourses || plannerItemsOnDay.length > 0 || calendarEventsOnDay.length > 0;
      }),
    [nextFiveDays, plannerItems, calEvents, courses, user.isCanvasOptIn]
  );

  return (
    <Card collapsing={false}>
      <VisuallyHidden>
        <Header data-testid="scheduleCardHeader">{format(selectedDay, 'dddd MMMM D')}</Header>
      </VisuallyHidden>
      <CardContent>
        <ScheduleCardDayMenu
          nextFiveDays={nextFiveDays}
          selectedDay={selectedDay}
          setSelectedDay={setSelectedDay}
          daysWithEvents={daysWithEvents}
        />
        {plannerItemsLoading && <Skeleton count={4} />}
        <div aria-live="assertive" aria-atomic="true">
          {!plannerItemsLoading && (
            <ScheduleCardAssignments selectedPlannerItems={selectedPlannerItems} />
          )}
          {courses.loading && <Skeleton count={4} />}
          {!courses.loading && <ScheduleCardCourses selectedCourses={selectedCourses} />}
          <ScheduleCardAcademicCalendar calEvents={selectedCalEvents} />
        </div>
      </CardContent>
      <CardFooter infoButtonId="academic-calendar"></CardFooter>
    </Card>
  );
};

export default ScheduleCard;
