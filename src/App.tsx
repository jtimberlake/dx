import React, { useEffect, useRef } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { Router, Location, RouteComponentProps } from '@reach/router';
import styled, { ThemeProvider } from 'styled-components/macro';
import { AnimatePresence } from 'framer-motion';
import ReactGA from 'react-ga';
import Header from './ui/Header';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Academics from './pages/Academics';
import Finances from './pages/Finances';
import Resources from './pages/Resources';
import About from './pages/About';
import Notifications from './pages/Notifications';
import PageNotFound from './pages/PageNotFound';
import Training from './pages/Training';
import Alerts from './features/Alerts';
import Footer from './ui/Footer';
import { useUser, usePlannerItems, useCards, useResources } from '@osu-wams/hooks';
import { useInfoButtons } from '@osu-wams/hooks';
import { themesLookup } from './theme/themes';
import { GlobalStyles } from './theme';
import {
  userState,
  themeState,
  infoButtonState,
  plannerItemState,
  dynamicCardState,
  resourceState,
} from './state';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { Types } from '@osu-wams/lib';
import { ReactQueryDevtools } from 'react-query-devtools/dist/react-query-devtools.production.min';
import MobileCovid from './pages/mobile-app/MobileCovid';

const ContentWrapper = styled.main`
  display: flex;
  flex-direction: row;
  align-items: stretch;
  height: 100%;
  width: 100%;
  flex-grow: 1;
`;

// Child of the ContentWrapper
const PageGridWrapper = styled.div`
  background-color: ${({ theme }) => theme.mainGrid.background};
  width: 100%;
`;

interface AppProps {
  containerElement: HTMLElement;
}

const RouterPage = (props: { pageComponent: JSX.Element } & RouteComponentProps) =>
  props.pageComponent;

const App = (props: AppProps) => {
  const [user, setUser] = useRecoilState<Types.UserState>(userState);
  const [theme, setTheme] = useRecoilState<string>(themeState);
  const [infoButtonData, setInfoButtonData] = useRecoilState(infoButtonState);
  const [plannerItemData, setPlannerItemData] = useRecoilState(plannerItemState);
  const setCards = useSetRecoilState(dynamicCardState);
  const setResources = useSetRecoilState(resourceState);
  const cardsHook = useCards();
  const resHook = useResources();
  const userHook = useUser();
  const infoButtons = useInfoButtons();
  const plannerItems = usePlannerItems({
    enabled: user.isCanvasOptIn,
    retry: false,
    // If the user had previously approved Canvas, but planner-items fails on the server side due to invalid oauth,
    // a 403 is returned to the frontend, the user isCanvasOptIn should be changed to false and the hook disabled, causing the
    // component to render the "Authorize Canvas" button giving the user the ability to opt-in again.
    // @ts-ignore never read
    onError: (err) => {
      const {
        response: { status },
      } = err as any;
      if (user.isCanvasOptIn && status === 403) {
        // This hook needs to reach into the UserState and call the underlying
        // setter on the user object rather than the `setUser` on the
        // recoil state itself.
        user.setUser!((prevUser) => ({
          ...prevUser,
          isCanvasOptIn: false,
          data: { ...prevUser.data, isCanvasOptIn: false },
        }));
      }
    },
  });

  const containerElementRef = useRef(props.containerElement);

  /* eslint-disable react-hooks/exhaustive-deps  */
  useEffect(() => {
    if (plannerItems.data && plannerItems.data !== plannerItemData.data) {
      setPlannerItemData({
        data: plannerItems.data,
        isLoading: plannerItems.isLoading,
        error: plannerItems.error,
      });
    }
  }, [plannerItems.data]);

  useEffect(() => {
    if (infoButtons.data !== infoButtonData) {
      setInfoButtonData(infoButtons.data);
    }
  }, [infoButtons.data]);

  useEffect(() => {
    if (cardsHook.isSuccess && cardsHook.data) {
      setCards({
        data: cardsHook.data,
        isLoading: cardsHook.isLoading,
        isSuccess: cardsHook.isSuccess,
      });
    }
  }, [cardsHook.data, cardsHook.isSuccess]);

  useEffect(() => {
    if (resHook.isSuccess && resHook.data) {
      setResources({
        data: resHook.data,
        isLoading: resHook.isLoading,
        isSuccess: resHook.isSuccess,
        isError: resHook.isError,
      });
    }
  }, [resHook.data, resHook.isSuccess]);

  /**
   * User Bootstrap for User setup
   */
  useEffect(() => {
    if (!userHook.loading && userHook.data !== user.data) {
      setUser(userHook);
    }
    if (!userHook.loading && !userHook.error && userHook.data.osuId) {
      containerElementRef.current.style.opacity = '1';
    }
  }, [userHook.data, userHook.loading, userHook.error]);

  /**
   * Targets Theme.tsx shared user state modifications
   */
  useEffect(() => {
    setTheme(user.data?.theme || theme);
  }, [theme, user.data.theme]);

  useEffect(() => {
    // Manage focus styles on keyboard navigable elements.
    //   - Add focus styles if tab used to navigate.
    //   - Start listening for clicks to remove focus styles.
    const handleTabOnce = (e) => {
      if (e.key === 'Tab') {
        document.body.classList.add('user-is-tabbing');
        window.removeEventListener('keydown', handleTabOnce);
        window.addEventListener('mousedown', handleMouseDownOnce);
      }
    };

    //   - Remove focus styles if mouse used to navigate.
    //   - Start listening for keydown to add focus styles.
    const handleMouseDownOnce = () => {
      document.body.classList.remove('user-is-tabbing');
      window.removeEventListener('mousedown', handleMouseDownOnce);
      window.addEventListener('keydown', handleTabOnce);
    };

    //   - Listen for keyboard navigation to start.
    window.addEventListener('keydown', handleTabOnce);
  }, []);

  // If logged in through mobile app, this is true
  // We use this to conditionally load/strip the header and footer
  const mobileApp = user.data.isMobile;

  return (
    <HelmetProvider>
      <ThemeProvider theme={themesLookup[theme]}>
        <GlobalStyles />
        {!mobileApp && <Header />}
        <Alerts />
        <ContentWrapper>
          <Location>
            {({ location }) => (
              <PageGridWrapper key={location.key}>
                {ReactGA.pageview(location.pathname + location.search + location.hash)}

                <AnimatePresence exitBeforeEnter>
                  <Router location={location} key={location.key} className="router-styles">
                    <RouterPage path="/" pageComponent={<Dashboard />} />
                    <RouterPage path="profile" pageComponent={<Profile />} />
                    <RouterPage path="academics/*" pageComponent={<Academics />} />
                    <RouterPage path="finances" pageComponent={<Finances />} />
                    <RouterPage path="resources" pageComponent={<Resources />} />
                    <RouterPage path="about" pageComponent={<About />} />
                    {process.env.REACT_APP_EXPERIMENTAL === 'true' && (
                      <RouterPage path="training" pageComponent={<Training />} />
                    )}
                    <RouterPage path="notifications" pageComponent={<Notifications />} />
                    <RouterPage default pageComponent={<PageNotFound />} />
                    {process.env.REACT_APP_EXPERIMENTAL === 'true' && (
                      <RouterPage path="covid" pageComponent={<MobileCovid />} />
                    )}
                  </Router>
                </AnimatePresence>
              </PageGridWrapper>
            )}
          </Location>
        </ContentWrapper>
        {!mobileApp && <Footer />}
      </ThemeProvider>
      {user.data.isAdmin && user.data.devTools && <ReactQueryDevtools initialIsOpen={false} />}
    </HelmetProvider>
  );
};

export default App;
