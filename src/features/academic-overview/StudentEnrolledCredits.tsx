import React, { useState, useEffect } from 'react';
import Skeleton from 'react-loading-skeleton';
import { Color } from '../../theme';
import {
  Highlight,
  HighlightTitle,
  HighlightEmphasis,
  HighlightDescription
} from '../../ui/Highlights';
import { getCourseSchedule, ICourseSchedule } from '../../api/student/course-schedule';

export const StudentEnrolledCredits: React.FC = () => {
  const [enrolledCredits, setEnrolledCredits] = useState<number>(0);
  const [enrolledCreditsLoading, setEnrolledCreditsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    getCourseSchedule()
      .then((res: ICourseSchedule[]) => {
        if (isMounted) {
          if (res.length) {
            const credits = res
              .map((c: ICourseSchedule) => c.attributes.creditHours)
              .reduce((a: number, v: number) => a + v);
            setEnrolledCredits(credits);
          }
          setEnrolledCreditsLoading(false);
        }
      })
      .catch(console.error);

    return () => {
      // prevents setting data on a component that has been unmounted before promise resolves
      isMounted = false;
    };
  }, []);

  return (
    <Highlight textAlignLeft>
      {enrolledCreditsLoading && <Skeleton count={5} />}
      {!enrolledCreditsLoading && (
        <>
          <HighlightEmphasis color={Color['orange-400']}>{enrolledCredits}</HighlightEmphasis>
          <HighlightTitle marginTop={0}>Credits</HighlightTitle>
          <HighlightDescription>Enrolled credits for current term.</HighlightDescription>
        </>
      )}
    </Highlight>
  );
};

export default StudentEnrolledCredits;
