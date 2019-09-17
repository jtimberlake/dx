import React from 'react';
import { fireEvent, waitForElement } from '@testing-library/react';
import { render } from '../../util/test-utils';
import mockCourseSchedule from '../../api/student/__mocks__/courses.data';
import Courses from '../Courses';
import { mockGAEvent } from '../../setupTests';

const mockGetCourseSchedule = jest.fn();

jest.mock('../../api/student', () => ({
  getCourseSchedule: () => mockGetCourseSchedule()
}));

describe('<Courses />', () => {
  beforeAll(() => {
    mockGetCourseSchedule.mockResolvedValue(Promise.resolve(mockCourseSchedule));
  });

  it('renders', () => {
    render(<Courses />);
  });

  it('renders a list of courses for the current user', async () => {
    const { getByText } = render(<Courses />);
    const courseTitle = await waitForElement(() => getByText(/data structures/i));
    expect(courseTitle).toBeInTheDocument();
  });

  it('Finds "8" as the course count in the Badge', async () => {
    const { getByText } = render(<Courses />);
    const NumCourses = await waitForElement(() => getByText('8'));
    expect(NumCourses).toBeInTheDocument();
  });
});

test('Specific course loads on click, close button closes', async () => {
  const { getByText, getByTestId, queryByTestId } = render(<Courses />);

  const OpSysBtn = await waitForElement(() => getByText(/data structures/i));
  fireEvent.click(OpSysBtn);

  // Dialg is present and displays the current course
  const courseDialog = await waitForElement(() => getByTestId('course-dialog'));
  expect(courseDialog).toBeInTheDocument();
  expect(courseDialog).toHaveTextContent(/data structures/i);

  // Close dialog
  const closeBtn = await waitForElement(() => getByText('Close'));
  fireEvent.click(closeBtn);
  expect(queryByTestId('course-dialog')).toBeNull();
});

test('Various Links are present as well as Google Analytics events are recorded', async () => {
  const { getByText, getByTestId } = render(<Courses />);

  const OpSysBtn = await waitForElement(() => getByText(/data structures/i));
  fireEvent.click(OpSysBtn);
  expect(mockGAEvent).toHaveBeenCalled();

  // Dialg is present and displays the current course
  const courseDialog = await waitForElement(() => getByTestId('course-dialog'));
  expect(courseDialog).toHaveTextContent(/data structures/i);

  // MapLink is present and clickable
  const MapLink = await waitForElement(() => getByText(/View Strand Agriculture Hall/i));
  fireEvent.click(MapLink);
  expect(mockGAEvent).toHaveBeenCalled();

  // Professor email link is clickable
  const ContactProfessorLink = await waitForElement(() => getByText(/E-mail Hess/i));
  fireEvent.click(ContactProfessorLink);
  expect(mockGAEvent).toHaveBeenCalled();

  // All Courses Link
  const ViewCoursesLink = await waitForElement(() => getByText(/view courses/i));
  fireEvent.click(ViewCoursesLink);
  expect(mockGAEvent).toHaveBeenCalled();
});

test('Course spells out the month and day "december 6" for Final exams', async () => {
  const { getByText, getByTestId } = render(<Courses />);

  const TestoBtn = await waitForElement(() => getByText(/testo physics/i));
  fireEvent.click(TestoBtn);

  // Dialg is present and displays the corrent course
  const courseDialog = await waitForElement(() => getByTestId('course-dialog'));
  expect(courseDialog).toBeInTheDocument();

  // For Final exams we spell out the month and day
  expect(courseDialog).toHaveTextContent(/december 6/i);
});

test('Footer has a Link that when clicked and Google Analytics Event fired', async () => {
  const { getByText } = render(<Courses />);
  const CanvasLink = await waitForElement(() => getByText(/View more in Canvas/i));
  fireEvent.click(CanvasLink);
  expect(mockGAEvent).toHaveBeenCalled();
});

describe('with an InfoButton in the CardFooter', () => {
  const validIinfoButtonId = 'current-courses';

  test('does not display the button when the infoButtonData is missing it', async () => {
    const { queryByTestId } = render(<Courses />, {
      appContext: {
        infoButtonData: [{ id: 'invalid-id', content: 'content', title: 'title' }]
      }
    });

    const element = queryByTestId(validIinfoButtonId);
    expect(element).not.toBeInTheDocument();
  });

  test('displays the button when the infoButtonData is included', async () => {
    const { getByTestId } = render(<Courses />, {
      appContext: {
        infoButtonData: [{ id: validIinfoButtonId, content: 'content', title: 'title' }]
      }
    });

    const element = await waitForElement(() => getByTestId(validIinfoButtonId));
    expect(element).toBeInTheDocument();
  });
});