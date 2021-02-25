import { selector, selectorFamily } from 'recoil';
import Fuse from 'fuse.js';
import { Types, User } from '@osu-wams/lib';
import { format } from 'src/util/helpers';
import { announcementState, ANNOUNCEMENT_PAGES } from './announcements';
import { resourceState } from './resources';
import { trainingState } from './trainings';
import { localistEventsState } from './events';
import { gradesState } from './grades';
import { courseState } from './courses';
import { plannerItemState } from './plannerItems';
import { canvasUrl } from 'src/features/canvas/CanvasPlannerItems';
import { userMessagesState } from './notifications';
import { matchedCourseContext, plannerItemDate } from 'src/features/course-utils';

export interface SearchItem {
  type: string;
  id: string;
  title: string;
  subText?: {
    html?: string;
    value?: string;
  };
  to?: string;
  href?: string;
  campuses?: string[];
  audience?: string[];
  attr: {
    announcement?: Types.Announcement;
    courses?: Types.CourseScheduleAttributes;
    event?: Types.LocalistEvent;
    grades?: Types.GradesAttributes;
    training?: Types.Training;
    notification?: Types.UserMessage;
    plannerItem?: Types.PlannerItem;
    resource?: Types.Resource;
  };
}

const eventSearchItems = selector<SearchItem[]>({
  key: 'eventSearchItems',
  get: ({ get }) => {
    const bendEvents = get(localistEventsState({ campus: 'bend' }));
    const studentEvents = get(localistEventsState({ affiliation: User.AFFILIATIONS.student }));
    const employeeEvents = get(localistEventsState({ affiliation: User.AFFILIATIONS.employee }));

    const events = [
      { audience: undefined, items: bendEvents },
      { audience: [User.AFFILIATIONS.student], items: studentEvents },
      { audience: [User.AFFILIATIONS.employee], items: employeeEvents },
    ];

    const all = events
      .map(({ audience, items: { data } }) =>
        data.map((event) => ({
          type: 'Event',
          id: event.id.toString(),
          title: event.title,
          subText: {
            value: format(event.date, 'EEEE, MMMM d, yyyy'),
          },
          href: event.action.link,
          campuses: event.campus_name ? [event.campus_name.toLowerCase()] : [],
          audience,
          attr: {
            event,
          },
        }))
      )
      .reduce((p, v) => p.concat(v), []);
    // unique array of items based on thier item.id
    return Array.from(new Map(all.map((item) => [item.id, item])).values());
  },
});

const announcementSearchItems = selector<SearchItem[]>({
  key: 'announcementSearchItems',
  get: ({ get }) => {
    const announcements = [
      get(announcementState(ANNOUNCEMENT_PAGES.academics)),
      get(announcementState(ANNOUNCEMENT_PAGES.dashboard)),
      get(announcementState(ANNOUNCEMENT_PAGES.finances)),
    ];
    const all = announcements
      .map((a) =>
        a.data.map((announcement) => ({
          type: 'Announcement',
          id: announcement.id,
          title: announcement.title,
          subText: {
            value: announcement.date ? format(announcement.date, 'EEEE, MMMM d, yyyy') : '',
          },
          href: announcement.action?.link,
          campuses: announcement.locations.map((a) => a.toLowerCase()),
          audience: announcement.affiliation.map((a) => a.toLowerCase()),
          attr: {
            announcement,
          },
        }))
      )
      .reduce((p, v) => p.concat(v), []);
    // unique array of items based on thier item.id
    return Array.from(new Map(all.map((item) => [item.id, item])).values());
  },
});

const gradesSearchItems = selector<SearchItem[]>({
  key: 'gradesSearchItems',
  get: ({ get }) => {
    const grades = get(gradesState);
    return grades.data.map((grade) => ({
      type: 'Past Course',
      id: grade.id,
      title: grade.attributes.courseSubjectNumber,
      subText: {
        html: `${grade.attributes.termDescription} &bull; ${grade.attributes.gradeFinal} &bull; ${grade.attributes.courseTitle}`,
      },
      to: '/student/academics/past-courses',
      attr: {
        grades: { ...grade.attributes },
      },
    }));
  },
});

const coursesSearchItems = selector<SearchItem[]>({
  key: 'coursesSearchItems',
  get: ({ get }) => {
    const courses = get(courseState);
    return courses.data.map((course) => ({
      type: 'Current Course',
      id: course.id,
      title: course.attributes.courseSubjectNumber,
      subText: { value: course.attributes.courseTitle },
      to: '/student/academics',
      attr: {
        courses: { ...course.attributes },
      },
    }));
  },
});

const trainingSearchItems = selector<SearchItem[]>({
  key: 'trainingSearchItems',
  get: ({ get }) => {
    const trainings = get(trainingState);
    return trainings.data.map((training) => ({
      type: 'Training',
      id: training.id,
      title: training.title,
      subText: { html: training.tags.join(' &bull; ') },
      to: '/employee/training',
      audience: [User.AFFILIATIONS.employee],
      attr: {
        training,
      },
    }));
  },
});

const resourceSearchItems = selector<SearchItem[]>({
  key: 'resourceSearchItems',
  get: ({ get }) => {
    const resources = get(resourceState);
    return resources.data.map((resource) => ({
      type: 'Resource',
      id: resource.id,
      title: resource.title,
      subText: { html: resource.categories.join(' &bull; ') },
      href: resource.link,
      campuses: resource.locations.map((l) => l.toLowerCase()),
      audience: resource.affiliation.map((a) => a.toLowerCase()),
      attr: {
        resource,
      },
    }));
  },
});

const notificationSearchItems = selector<SearchItem[]>({
  key: 'notificationSearchItems',
  get: ({ get }) => {
    const notifications = get(userMessagesState);
    return notifications.data.map((notification) => ({
      type: 'Notification',
      id: notification.messageId,
      title: notification.title,
      subText: {
        value: notification.deliveredAt
          ? `Received ${format(notification.deliveredAt, "EEEE, MMMM d'th at ' h:mm a")}`
          : '',
      },
      attr: {
        notification,
      },
    }));
  },
});

const plannerItemSearchItems = selector<SearchItem[]>({
  key: 'plannerItemSearchItems',
  get: ({ get }) => {
    const plannerItems = get(plannerItemState);
    const courses = get(courseState);

    return plannerItems.data.map((plannerItem) => {
      const matched = matchedCourseContext(courses.data, plannerItem.context_name);
      const subTextItems: string[] = [];
      if (matched) {
        subTextItems.push(`${matched.courseSubject} ${matched.courseNumber}`);
      }
      const date = plannerItemDate(plannerItem.context_type, plannerItem.plannable_date);
      if (date) {
        subTextItems.push(date);
      }

      return {
        type: 'Canvas',
        id: `${plannerItem.course_id}-${plannerItem.plannable_id}`,
        title: plannerItem.plannable.title,
        subText: {
          html: subTextItems.join(' &bull; '),
        },
        href: canvasUrl(plannerItem.html_url),
        attr: {
          plannerItem,
        },
      };
    });
  },
});

const fuseOptions: Fuse.IFuseOptions<SearchItem> = {
  includeScore: true,
  minMatchCharLength: 2,
  threshold: 0.1, // the lower the number, the more exact the match, 0.2 seems too broad
  ignoreLocation: true,
  keys: [
    'title',
    'attr.announcement.action.title',
    'attr.announcement.body',
    'attr.courses.courseNumber',
    'attr.courses.courseReferenceNumber',
    'attr.courses.courseSubject',
    'attr.courses.courseSubjectDescription',
    'attr.courses.courseSubjectNumber',
    'attr.courses.courseTitle',
    'attr.courses.faculty.email',
    'attr.courses.faculty.name',
    'attr.courses.meetingTimes.building',
    'attr.courses.meetingTimes.buildingDescription',
    'attr.courses.meetingTimes.campus',
    'attr.courses.termDescription',
    'attr.event.action.title',
    'attr.event.body',
    'attr.event.city',
    'attr.grades.courseNumber',
    'attr.grades.courseReferenceNumber',
    'attr.grades.courseSubject',
    'attr.grades.courseSubjectDescription',
    'attr.grades.courseSubjectNumber',
    'attr.grades.courseTitle',
    'attr.grades.gradeFinal',
    'attr.notification.content',
    'attr.plannerItem.context_name',
    'attr.plannerItem.context_type',
    'attr.plannerItem.plannable.title',
    'attr.plannerItem.plannable_type',
    'attr.resource.synonyms',
    'attr.training.audiences',
    'attr.training.body',
    'attr.training.contact',
    'attr.training.cost',
    'attr.training.courseDesign',
    'attr.training.department',
    'attr.training.duration',
    'attr.training.frequency',
    'attr.training.prerequisites',
    'attr.training.tags',
    'attr.training.type',
    'attr.training.websiteTitle',
    'attr.training.websiteUri',
  ],
};

export const fuseIndex = selector<Fuse<SearchItem>>({
  key: 'fuseIndex',
  get: ({ get }) => {
    const announcements = get(announcementSearchItems);
    const trainings = get(trainingSearchItems);
    const resources = get(resourceSearchItems);
    const events = get(eventSearchItems);
    const grades = get(gradesSearchItems);
    const courses = get(coursesSearchItems);
    const plannerItems = get(plannerItemSearchItems);
    const notifications = get(notificationSearchItems);
    const items: SearchItem[] = [
      ...announcements,
      ...trainings,
      ...resources,
      ...events,
      ...grades,
      ...courses,
      ...plannerItems,
      ...notifications,
    ];
    return new Fuse(items, fuseOptions);
  },
});

export const searchIndex = selectorFamily<Fuse.FuseResult<SearchItem>[], string>({
  key: 'searchIndex',
  get: (query) => ({ get }) => {
    const index = get(fuseIndex);
    const results = index.search(query);
    return results;
  },
});
