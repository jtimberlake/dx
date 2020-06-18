import React, { FC, useContext } from 'react';
import VisuallyHidden from '@reach/visually-hidden';
import styled, { ThemeContext } from 'styled-components/macro';
import ReactGA from 'react-ga';
import generateId from 'uuid/v4';
import { faMapMarkerAlt, faEnvelope } from '@fortawesome/pro-light-svg-icons';
import Icon from '../ui/Icon';
import { CloseButton } from 'src/ui/Button';
import {
  List,
  ListItem,
  ListItemContent,
  ListItemText,
  ListItemHeader,
  ListItemDescription,
  ListItemLeadText,
} from 'src/ui/List';
import MyDialog, { MyDialogFooter, MyDialogHeader } from 'src/ui/MyDialog';
import { formatTime, format, singularPlural } from 'src/util/helpers';
import { getIconByScheduleType } from './course-utils';
import Divider from 'src/ui/Divider';
import { ExternalLink } from 'src/ui/Link';
import Url from 'src/util/externalUrls.data';
import { Event } from 'src/util/gaTracking';
import {
  ICoursesMap,
  exceptMeetingTypes,
  meetingTimeOnCorvallisCampus,
  onlyMeetingTypes,
  examName,
} from './schedule/schedule-utils'; // eslint-disable  @typescript-eslint/no-unused-vars
import { fontSize, spacing, ThemeConfiguration } from 'src/theme';
import { Types } from '@osu-wams/lib';

interface ICourse {
  coursesMap: ICoursesMap;
  isOpen: boolean;
  toggleCourse: Function;
}

const CourseListItem = styled(ListItem)`
  &:last-child {
    margin-bottom: 0;
  }
`;

const FacultyLink = styled.a`
  font-size: ${fontSize[14]};
  color: ${({ theme }) => theme.features.academics.courses.dialog.faculty.link.color};
  text-decoration: none;
  svg {
    margin-right: ${spacing.default};
    vertical-align: bottom;
    width: ${fontSize[20]} !important;
    height: ${fontSize[20]} !important;
    font-size: ${fontSize[14]} !important;
  }
`;

const MapLink = styled(FacultyLink)`
  color: ${({ theme }) => theme.features.academics.courses.dialog.map.link.color};
  svg {
    margin-right: 0;
    font-size: ${fontSize[26]} !important;
    width: ${fontSize[26]} !important;
    height: ${fontSize[26]} !important;
  }
`;

const meetingDateTime = (meetingTime: Types.CourseScheduleMeetingTime): string => {
  const date =
    meetingTime.beginDate !== meetingTime.endDate
      ? meetingTime.weeklySchedule.map((day) => day)
      : format(meetingTime.beginDate, 'MMMM d');
  const time =
    meetingTime.beginTime &&
    `\u00B7 ${formatTime(meetingTime.beginTime)} - ${formatTime(meetingTime.endTime)}`;
  return `${date || ''} ${time || ''}`;
};

const meetingTimeListItem = (
  meetingTime: Types.CourseScheduleMeetingTime,
  themeContext: ThemeConfiguration
): JSX.Element => (
  <CourseListItem key={generateId()}>
    <ListItemContent style={{ paddingBottom: 0 }}>
      <Icon
        icon={getIconByScheduleType(meetingTime.scheduleType)}
        color={themeContext.features.academics.courses.dialog.meetingTime.icon.color}
      />
      <ListItemText>
        <ListItemHeader>{meetingTime.scheduleDescription}</ListItemHeader>
      </ListItemText>
      {meetingTimeOnCorvallisCampus(meetingTime) &&
        buildingCampusMap(
          meetingTime.building,
          meetingTime.buildingDescription,
          meetingTime.room,
          themeContext
        )}
    </ListItemContent>
    <ListItemContent style={{ marginTop: 0, marginBottom: 0, paddingBottom: 0 }}>
      <ListItemText>
        <ListItemDescription>
          {meetingTime.room && meetingTime.room}{' '}
          {meetingTime.buildingDescription && meetingTime.buildingDescription}
        </ListItemDescription>
        <ListItemDescription>{meetingDateTime(meetingTime)}</ListItemDescription>
      </ListItemText>
    </ListItemContent>
  </CourseListItem>
);

const facultyListItem = (
  faculty: Types.CourseScheduleFaculty,
  index: number,
  themeContext: ThemeConfiguration
): JSX.Element => (
  <CourseListItem key={`${faculty.email}-${index}`}>
    <ListItemContent style={{ paddingBottom: 0 }}>
      <FacultyLink
        href={`mailto:${faculty.email}`}
        onClick={() => Event('course', 'email professor icon clicked', faculty.name)}
      >
        <VisuallyHidden>E-mail {faculty.name}</VisuallyHidden>
        <ListItemText>
          <Icon
            icon={faEnvelope}
            color={themeContext.features.academics.courses.dialog.faculty.icon.color}
          />{' '}
          {faculty.name}
        </ListItemText>
      </FacultyLink>
    </ListItemContent>
  </CourseListItem>
);

const buildingCampusMap = (
  building: string,
  buildingDescription: string,
  room: string,
  themeContext: ThemeConfiguration
): JSX.Element => (
  <MapLink
    href={Url.campusMap.building + building}
    target="_blank"
    rel="noopener noreferrer"
    onClick={() => Event('course', 'course location clicked', Url.campusMap.building + building)}
  >
    <VisuallyHidden>View {buildingDescription} on map</VisuallyHidden>
    <ListItemText>
      <Icon
        icon={faMapMarkerAlt}
        color={themeContext.features.academics.courses.dialog.map.icon.color}
      />
    </ListItemText>
  </MapLink>
);

const Course: FC<ICourse> = ({ coursesMap, isOpen, toggleCourse }) => {
  const themeContext = useContext(ThemeContext);
  return (
    <MyDialog
      padding="false"
      isOpen={isOpen}
      onDismiss={() => toggleCourse()}
      data-testid="course-dialog"
      aria-labelledby="course-title"
    >
      {ReactGA.modalview('/academics/course-details')}
      <MyDialogHeader>
        <CloseButton onClick={toggleCourse} />
        <div>
          <ListItemLeadText data-testid="course-list-item-header">
            <div>{coursesMap.subject}</div>
            <div>
              <strong>{coursesMap.number}</strong>
            </div>
          </ListItemLeadText>
          <ListItemText>
            <ListItemDescription
              fontSize={fontSize[16]}
              color={themeContext.features.academics.courses.list.title.color}
            >
              {coursesMap.title}
            </ListItemDescription>
            <ListItemDescription>
              {coursesMap.creditHours} {singularPlural(coursesMap.creditHours, 'Credit')}
            </ListItemDescription>
          </ListItemText>
        </div>
      </MyDialogHeader>
      {coursesMap.courses.map((course, index) => (
        <div key={generateId()} style={{ padding: '0.5rem' }}>
          {index > 0 && <Divider />}
          <List>
            {exceptMeetingTypes(course.attributes.meetingTimes, ['MID', 'FNL']).map((m) =>
              meetingTimeListItem(m, themeContext)
            )}
          </List>
          <List>
            {course.attributes.faculty.map((fac: Types.CourseScheduleFaculty, index: number) =>
              facultyListItem(fac, index, themeContext)
            )}
          </List>
        </div>
      ))}
      {onlyMeetingTypes(coursesMap.meetingTimes, ['FNL']).length > 0 && (
        <>
          <Divider />
          <List>
            <CourseListItem key={generateId()}>
              <ListItemContent style={{ paddingBottom: 0 }}>
                <ListItemText>
                  <ListItemHeader>Other Meetings</ListItemHeader>
                </ListItemText>
              </ListItemContent>
            </CourseListItem>
            {onlyMeetingTypes(coursesMap.meetingTimes, ['FNL']).map((m) => (
              <CourseListItem key={generateId()}>
                <ListItemContent>
                  <ListItemText>
                    <ListItemHeader>{examName(m)}</ListItemHeader>
                    <ListItemDescription>{meetingDateTime(m)}</ListItemDescription>
                  </ListItemText>
                </ListItemContent>
              </CourseListItem>
            ))}
          </List>
        </>
      )}
      <MyDialogFooter>
        <ExternalLink
          href={Url.canvas.main}
          onClick={() => Event('course', 'view courses clicked')}
        >
          View courses
        </ExternalLink>
      </MyDialogFooter>
    </MyDialog>
  );
};

export default Course;
