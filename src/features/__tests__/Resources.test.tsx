import React from 'react';
import { wait } from '@testing-library/react';
import { render, authUser, mockEmployeeUser } from '../../util/test-utils';
import userEvent from '@testing-library/user-event';
import ResourcesComponent from '../../pages/Resources';
import { mockGAEvent, mockTrendingEvent } from '../../setupTests';
import { Resources } from '@osu-wams/hooks';

const mockUseResources = jest.fn();
const mockUseCategories = jest.fn();
const mockDefaultCategory = jest.fn();
const mockPostFavorite = jest.fn();
const { resourcesData, categoriesData, defaultCategory } = Resources.mockResources;

jest.mock('@osu-wams/hooks', () => {
  const original = jest.requireActual('@osu-wams/hooks');
  return {
    ...original,
    useResources: () => mockUseResources(),
    useCategories: () => mockUseCategories(),
    defaultCategoryName: () => mockDefaultCategory(),
    Resources: {
      ...original.Resources,
      postFavorite: () => mockPostFavorite()
    }
  };
});

/**
 * Render Resources with the most commonly used features
 * We reuse a lot of these elements in our tests
 * Here we can simplify the logic in one place
 */
const renderResources = (userType?: any) => {
  let utils;
  if (!userType) {
    utils = render(<ResourcesComponent />);
  } else {
    utils = render(<ResourcesComponent />, {
      user: userType
    });
  }
  const featured = utils.getByLabelText('Featured');
  const all = utils.getByLabelText('All');
  const searchInput = utils.getByPlaceholderText('Find resources') as HTMLInputElement;
  const financial = utils.getByLabelText('Financial');

  return {
    ...utils,
    searchInput,
    featured,
    financial,
    all
  };
};

describe('<Resources />', () => {
  // Set mock function result before running any tests
  beforeEach(() => {
    mockUseResources.mockReturnValue(resourcesData);
    mockUseCategories.mockReturnValue(categoriesData);
    mockDefaultCategory.mockReturnValue(defaultCategory);
  });

  it('should display the title Resources', async () => {
    const { findByText } = renderResources();
    expect(await findByText('Resources', { selector: 'h1' })).toBeInTheDocument();
  });

  it('should have the Featured tag selected', async () => {
    const { all, featured, queryByText, findByText } = renderResources();

    await wait(() => expect(featured).toHaveClass('selected'));
    expect(all).not.toHaveClass('selected');
    expect(findByText(/Billing Information/)).not.toBeNull();
    expect(queryByText(/Webcams/)).toBeNull();
  });

  it('Should have a link to skip to results with matching ID in the result container', async () => {
    const { getByText, findByTestId } = renderResources();
    const skipLink = getByText('Skip to results');
    const anchor = skipLink.getAttribute('href')!.slice(1);
    const results = await findByTestId('resourcesResults');
    const resultsId = results.getAttribute('id');

    expect(anchor).toEqual(resultsId);
  });

  it('should have "Featured" selected and clickable All category that gets appripriate results', async () => {
    mockDefaultCategory.mockReturnValue('All');
    const { findByText, all, featured } = renderResources();

    expect(featured).toHaveClass('selected'); // default selected

    userEvent.click(all);

    expect(featured).not.toHaveClass('selected');
    expect(all).toHaveClass('selected');
    expect(await findByText(/Student Jobs/)).toBeInTheDocument();
    expect(await findByText(/Billing Information/)).toBeInTheDocument();
  });

  it('should have clickable categories that report to GoogleAnalytics', async () => {
    const { getByText } = renderResources();
    const BillingInformationResource = await getByText(/Billing Information/);
    expect(BillingInformationResource).not.toBeNull();
    userEvent.click(BillingInformationResource);
    expect(mockGAEvent).toHaveBeenCalledTimes(1);
    expect(mockTrendingEvent).toHaveBeenCalledTimes(1);
  });

  it('should empty input and get results for that category only when clicking category link', async () => {
    mockDefaultCategory.mockReturnValue(defaultCategory);
    const { searchInput, getByLabelText, findByText } = renderResources();

    const academic = getByLabelText('Academic');

    // Search input value changed to "noResults"
    await userEvent.type(searchInput, 'noResults');

    expect(await findByText(/found 0 results/)).toBeInTheDocument();
    userEvent.click(academic);
    expect(await findByText(/Student Athletes/)).toBeInTheDocument();
    expect(await findByText(/found 1 result/)).toBeInTheDocument();
    // Search input should be clear, 'noResults' should be gone
    expect(searchInput.value).toEqual('');
  });

  it('Changes Search term should re-run the search effectively', async () => {
    const { queryByText, searchInput, findByText, debug } = renderResources();

    await userEvent.type(searchInput, 'billingNotThere');

    expect(await findByText(/found 0 results/)).toBeInTheDocument();
    expect(queryByText(/Billing Information/)).toBeNull();

    // We need to clear the input value if not the below interaction sits on top of the previous
    searchInput.value = '';

    await userEvent.type(searchInput, 'billing');

    expect(await findByText(/Billing Information/)).toBeInTheDocument();
  });

  it('should be able to reselect a category and get appropriate data back', async () => {
    const { queryByText, findByText, getByLabelText, all } = renderResources();

    const academic = getByLabelText('Academic');

    userEvent.click(all);
    userEvent.click(academic);
    expect(academic).toHaveClass('selected');
    expect(all).not.toHaveClass('selected');
    expect(await findByText(/Student Athletes/)).toBeInTheDocument();
    expect(queryByText(/Billing Information/)).toBeNull();
  });

  it('should load a different category based on the URL parameter', async () => {
    let location = {
      ...window.location,
      search: '?category=all'
    };
    Object.defineProperty(window, 'location', {
      writable: true,
      value: location
    });
    const { findByText, featured, all } = renderResources();

    expect(featured).not.toHaveClass('selected');
    expect(all).toHaveClass('selected');
    expect(await findByText(/Billing Information/)).toBeInTheDocument();
    expect(await findByText(/Student Jobs/)).toBeInTheDocument();
    location.search = '';
  });

  describe('Favorite Resources tests', () => {
    it('should have favorites category when user has active favorites resources', async () => {
      const { findByText } = renderResources();
      const favorites = await findByText(/favorites/i);
      expect(favorites).toBeInTheDocument();
      userEvent.click(favorites);
      expect(await findByText(/found 2 results/i)).toBeInTheDocument();
    });

    it('Finds Student Jobs resource, clicking on heart input adds it as a favorite', async () => {
      const { findByText, all } = renderResources();
      userEvent.click(all);

      expect(await findByText(/Student Jobs/)).toBeInTheDocument();
      var el = document.querySelector(
        `input[aria-label="Add Student Jobs link to your favorite resources"]`
      );
      expect(el).toBeInTheDocument();

      userEvent.click(el);
      expect(await mockPostFavorite).toHaveBeenCalledTimes(1);
      expect(await authUser.refreshFavorites).toHaveBeenCalledTimes(1);
      expect(mockGAEvent).toHaveBeenCalledTimes(2);
    });

    it('should not find the favorites category button when user does not have favorites resources', async () => {
      const noFavUser = { ...authUser, data: { ...authUser.data, favoriteResources: [] } };
      const { queryByText } = renderResources(noFavUser);

      expect(queryByText(/favorites/i)).toBeNull();
    });
  });

  it('should move to the All category when searching', async () => {
    const { findByText, queryByText, featured, all, searchInput } = renderResources();

    expect(featured).toHaveClass('selected');
    expect(all).not.toHaveClass('selected');
    await userEvent.type(searchInput, 'student job');
    expect(await findByText(/found 1 result/)).toBeInTheDocument();
    expect(await findByText(/Student Jobs/)).toBeInTheDocument();

    expect(featured).not.toHaveClass('selected');
    expect(all).toHaveClass('selected');

    expect(queryByText(/Billing Information/)).toBeNull();
  });

  describe('with audiences', () => {
    it('shows all resources', async () => {
      const newAuthUser = { ...authUser, classification: { id: authUser.data.osuId } };
      const { findByText, all } = renderResources(newAuthUser);

      userEvent.click(all);
      expect(all).toHaveClass('selected');
      expect(await findByText(/Billing Information/)).toBeInTheDocument();
      expect(await findByText(/Student Jobs/)).toBeInTheDocument();
    });
  });

  describe('with student and employee affiliations', () => {
    it('finds Listservs as an employee but not Student Jobs, since that is student only', async () => {
      mockDefaultCategory.mockReturnValue('All');
      const { queryByText, findByText, all } = renderResources(mockEmployeeUser);
      userEvent.click(all);

      expect(all).toHaveClass('selected');
      expect(await findByText(/found 3 results/)).toBeInTheDocument();
      expect(await findByText(/Listservs/)).toBeInTheDocument();
      expect(await queryByText(/Student Jobs/)).toBeNull();
      expect(await queryByText(/Academics for Student Athletes/)).toBeNull();
    });

    it('finds Listservs as an employee when clicking the Financial category', async () => {
      mockDefaultCategory.mockReturnValue('Financial');
      const { queryByText, findByText, financial } = renderResources(mockEmployeeUser);

      userEvent.click(financial);

      expect(financial).toHaveClass('selected');
      expect(await findByText(/found 2 results/)).toBeInTheDocument();
      expect(await findByText(/Listservs/)).toBeInTheDocument();
      expect(await queryByText(/Student Jobs/)).toBeNull();
    });

    it('cannot find "Student Jobs" when searching as an Employee, but finds "Listservs"', async () => {
      const { queryByText, findByText, searchInput } = renderResources(mockEmployeeUser);

      await userEvent.type(searchInput, 'student job');
      // Student Jobs resources is null because it's only there for Student, not employee
      expect(await queryByText(/Student Jobs/)).toBeNull();

      await userEvent.type(searchInput, 'Listservs');
      expect(await findByText(/Listservs/)).toBeInTheDocument();
    });

    it('cannot find "Listservs" when searching as a Student, but finds "Student Jobs"', async () => {
      const { queryByText, findByText, searchInput } = renderResources();

      await userEvent.type(searchInput, 'student job');
      expect(await findByText(/Student Jobs/)).toBeInTheDocument();

      await userEvent.type(searchInput, 'Listservs');
      expect(await queryByText(/Listservs/)).toBeNull();
    });

    it('finds "Student Jobs" and "Billing Information" but not "Listservs" when clicking the Financial category', async () => {
      const { queryByText, getByText, findByText, financial } = renderResources();

      userEvent.click(financial);

      expect(financial).toHaveClass('selected');
      expect(await findByText(/found 2 results/)).toBeInTheDocument();
      expect(queryByText(/Listservs/)).toBeNull();
      expect(getByText(/Student Jobs/)).toBeInTheDocument();
      expect(getByText(/Billing Information/)).toBeInTheDocument();
    });

    it('finds the 3 student resources and cannot find Listservs employee resource', async () => {
      const { queryByText, findByText, all } = renderResources();

      await userEvent.click(all);
      expect(all).toHaveClass('selected');
      expect(await findByText(/found 3 results/)).toBeInTheDocument();
      expect(await findByText(/Student Jobs/)).toBeInTheDocument();
      expect(await queryByText(/Listservs/)).toBeNull();
    });
  });
});
