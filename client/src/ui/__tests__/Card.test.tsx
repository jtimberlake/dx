import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { Card, CardContent, CardHeader, CardFooter, Badge } from '../Card';
import Button from '../Button';
import { Color } from '../../theme';

jest.mock('uuid/v4', () => jest.fn(() => 'carduuid'));

// Standard card that is used most frequently in this app - should have thorough test coverage
const StandardCard = () => (
  <Card data-testid="StandardCard">
    <CardHeader
      data-testid="StandardCardHeader"
      title="Header"
      badge={<Badge color={Color['orange-400']}>{4}</Badge>}
    />
    <CardContent data-testid="StandardCardContent">Content</CardContent>
    <CardFooter>
      <Button>View all</Button>
    </CardFooter>
  </Card>
);

const CardNoBadge = () => (
  <Card data-testid="CardNoBadge">
    <CardHeader data-testid="CardNoBadgeHeader" title="Header" />
    <CardContent>Content</CardContent>
    <CardFooter>
      <Button>View all</Button>
    </CardFooter>
  </Card>
);

describe('<Card />', () => {
  it('should render', () => {
    const { getByTestId } = render(<StandardCard />);
    expect(getByTestId(/StandardCardContent/i)).toBeInTheDocument();
  });

  it('should display a title in the header', () => {
    const { getByTestId } = render(<StandardCard />);
    expect(getByTestId(/standardcardheader/i)).toHaveTextContent(/header/i);
  });

  it('should display a badge in the header if one is supplied', () => {
    const { getByTestId } = render(<StandardCard />);
    expect(getByTestId(/standardcardheader/i)).toHaveTextContent('4');
  });

  it('should not display a badge if no badge supplied', () => {
    const { getByTestId } = render(<CardNoBadge />);
    expect(getByTestId(/cardnobadgeheader/i).textContent).toEqual('Header');
  });

  it('should not display card content when collapsed', () => {
    const { getByTestId } = render(<StandardCard />);
    expect(getByTestId(/standardcardcontent/i)).not.toBeVisible();
  });

  it('should display card content when expanded', () => {
    const { getByTestId } = render(<StandardCard />);
    expect(getByTestId(/standardcardcontent/i)).not.toBeVisible();
    fireEvent.click(getByTestId('StandardCardHeader'));
    expect(getByTestId(/standardcardcontent/i)).toBeVisible();
    fireEvent.click(getByTestId('StandardCardHeader'));
    expect(getByTestId(/standardcardcontent/i)).not.toBeVisible();
  });

  it('should display card content by default on larger screens', () => {
    // Mock matchMedia to return true (larger screen).
    // Todo: This is probably brittle and we should consider modifying the behavior in setupTests.js
    //       to utilize the screen size set by JSDOM and modify that instead when testing.
    const matchMedia = window.matchMedia;
    Object.defineProperty(window, 'matchMedia', {
      value: jest.fn(() => ({ matches: true, addListener: () => {}, removeListener: () => {} }))
    });

    const { getByTestId } = render(<StandardCard />);
    expect(getByTestId(/standardcardcontent/i)).toBeVisible();
    Object.defineProperty(window, 'matchMedia', matchMedia);
  });
});
