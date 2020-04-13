import React, { useContext } from 'react';
import { ThemeContext } from 'styled-components/macro';
import { faFileAlt } from '@fortawesome/pro-light-svg-icons';
import {
  CardSection,
  SectionHeader,
  NoItems,
  NoItemsImage,
  NoItemsText,
} from './ScheduleCardStyles';
import Url from 'src/util/externalUrls.data';
import Icon from 'src/ui/Icon';
import assignment from 'src/assets/assignment.svg';
import {
  List,
  ListItem,
  ListItemHeader,
  ListItemDescription,
  ListItemText,
  ListItemContentLink,
} from 'src/ui/List';
import { AuthorizeCanvasCompact } from '../canvas/AuthorizeCanvas';
import { Event } from 'src/util/gaTracking';
import { courseCodeOrIcon } from '../Courses';
import { format } from 'src/util/helpers';
import { AppContext } from 'src/contexts/app-context';

const ScheduleCardAssignments = ({ selectedPlannerItems, courseList }) => {
  const themeContext = useContext(ThemeContext);
  const { user } = useContext(AppContext);

  const noAssignmentsDue = () => (
    <NoItems as="li">
      <NoItemsImage src={assignment} alt="" />
      <NoItemsText>No Canvas assignments due</NoItemsText>
    </NoItems>
  );

  return (
    <CardSection>
      <SectionHeader>Assignments</SectionHeader>
      <List>
        {!user.isCanvasOptIn && <AuthorizeCanvasCompact />}
        {user.isCanvasOptIn && selectedPlannerItems.length === 0 && noAssignmentsDue()}
        {user.isCanvasOptIn &&
          selectedPlannerItems.length > 0 &&
          selectedPlannerItems.map(
            ({
              context_name,
              plannable_id,
              html_url,
              plannable_type,
              plannable_date,
              plannable: { title },
            }) => (
              <ListItem key={plannable_id}>
                <ListItemContentLink
                  href={Url.canvas.main + html_url ?? ''}
                  onClick={() =>
                    Event('schedule-card', 'canvas-link', `${Url.canvas.main + html_url ?? title}`)
                  }
                >
                  {courseCodeOrIcon(
                    context_name,
                    courseList,
                    <Icon
                      icon={faFileAlt}
                      color={themeContext.features.academics.courses.plannerItems.list.icon.color}
                    />
                  )}
                  <ListItemText>
                    <ListItemHeader>{title} </ListItemHeader>
                    <ListItemDescription>
                      {plannable_type &&
                        plannable_date &&
                        plannable_type !== 'announcement' &&
                        `Due ${format(plannable_date, 'dueAt')}`}
                    </ListItemDescription>
                  </ListItemText>
                </ListItemContentLink>
              </ListItem>
            )
          )}
      </List>
    </CardSection>
  );
};

export { ScheduleCardAssignments };
