import React from 'react';
import { faGraduationCap } from '@fortawesome/pro-light-svg-icons';
import Courses from '../../features/Courses';
import AnnouncementContainer from '../../ui/AnnouncementContainer';
import { MainGridWrapper, MainGrid, MainGridCol, PageGridWrapper } from '../../ui/PageGrid';
import PlannerItems from '../../features/PlannerItems';
import AcademicCalendar from '../../features/AcademicCalendar';
import PageTitle from '../../ui/PageTitle';
import AcademicOverview from '../../features/AcademicOverview';
import ResourcesCard from '../../features/ResourcesCard';
import { AcademicSubNav } from './AcademicsSubNav';

const AcademicsDashboard = () => {
  return (
    <PageGridWrapper>
      <MainGridWrapper>
        <PageTitle title="Academics" />
        <AcademicSubNav />
        <MainGrid data-testid="academics-dashboard">
          <MainGridCol>
            <AcademicOverview />
            <PlannerItems />
            <Courses />
          </MainGridCol>
          <MainGridCol>
            <ResourcesCard categ="academic" icon={faGraduationCap} />
            <AcademicCalendar />
          </MainGridCol>
        </MainGrid>
      </MainGridWrapper>
      <AnnouncementContainer data-testid="academics-announcements" page="academics" />
    </PageGridWrapper>
  );
};

export default AcademicsDashboard;
