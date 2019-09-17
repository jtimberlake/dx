import ReactGA from 'react-ga';
import '@testing-library/jest-dom/extend-expect';
import 'jest-styled-components';
import { Event } from '../src/util/gaTracking';

ReactGA.initialize('UA-48705802-13', {
  testMode: true
});

export const mockGAEvent = jest.fn();

jest.mock('../src/util/gaTracking', () => ({
  Event: () => {
    return mockGAEvent();
  }
}));

mockGAEvent.mockResolvedValue(Promise.resolve(true));

// Mock matchMedia for test env
const matchMedia = () => ({
  matches: false,
  addListener: () => {},
  removeListener: () => {}
});

window.matchMedia = window.matchMedia || matchMedia;