import React from 'react';
import { faGraduationCap } from '@fortawesome/pro-light-svg-icons';
import Courses from '../../features/Courses';
import AnnouncementContainer from '../../ui/AnnouncementContainer';
import { MainGridWrapper, Masonry, MainGrid, MainGridCol } from '../../ui/PageGrid';
import PlannerItems from '../../features/PlannerItems';
import AcademicCalendar from '../../features/AcademicCalendar';
import PageTitle from '../../ui/PageTitle';
import AcademicOverview from '../../features/AcademicOverview';
import ResourcesCard from '../../features/ResourcesCard';
import { AcademicSubNav } from './AcademicsSubNav';

const AcademicsDashboard = () => {
  return (
    <>
      <MainGridWrapper data-testid="academics-dashboard">
        <PageTitle title="Academics" />
        <AcademicSubNav />
        <Masonry>
          <AcademicOverview />
          <PlannerItems />
          <Courses />
          <ResourcesCard categ="academic" icon={faGraduationCap} />
          <AcademicCalendar />
        </Masonry>
      </MainGridWrapper>
      <AnnouncementContainer data-testid="academics-announcements" page="academics" />
    </>
  );
};

export default AcademicsDashboard;
