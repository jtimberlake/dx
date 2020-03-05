import React, { useContext } from 'react';
import 'react-toastify/dist/ReactToastify.min.css';
import logo from '../assets/osu-logo.svg';
import ecampusLogo from '../assets/osu-ecampus.svg';
import cascadesLogo from '../assets/osu-cascades.svg';
import '@reach/menu-button/styles.css';
import MainNav from './MainNav/';
import { HeaderNav } from './HeaderNav';
import { breakpoints, styled, themeSettings } from '../theme';
import { User } from '@osu-wams/hooks';
import { User as UserUtil } from '@osu-wams/lib';
import { Types } from '@osu-wams/lib';
import { BetaBadge } from './Badge';
import { AppContext } from 'src/contexts/app-context';

const { usersCampus, CAMPUS_CODES } = User;

const HeaderWrapper = styled.div`
  display: flex;
  width: 100%;
  background-color: ${({ theme }) => theme.header.background};
  justify-content: space-between;
  flex-flow: row wrap;
  padding: 8px 8px 12px;
  align-items: center;
  @media (min-width: ${breakpoints.small}) {
    display: block;
    height: 100px;
  }
`;

const Navigation = styled.div`
  @media (min-width: ${breakpoints.small}) {
    padding: 0 ${themeSettings.spacing.desktop};
    /* match main gride color */
    border-top: 1px solid ${({ theme }) => theme.mainGrid.borderTop};
    /* navigation should blend with header background */
    background-color: ${({ theme }) => theme.header.background};
  }
`;

const SiteTitle = styled.header`
  display: none;
  @media (min-width: ${breakpoints.small}) {
    display: block;
    font-size: ${themeSettings.fontSize[20]};
    font-weight: 300;
    margin: 0 auto;
    text-align: center;
    max-width: ${breakpoints.large};
    margin-top: 20px;
  }
  @media (min-width: ${breakpoints.medium}) {
    font-size: ${themeSettings.fontSize[26]};
  }
  @media (min-width: 1750px) {
    text-align: left;
  }
`;

const Logo = styled.img`
  order: 0;
  height: 60px;
  @media (min-width: ${breakpoints.small}) {
    height: 80px;
    position: absolute;
    top: 10px;
    left: 10px;
  }
`;

/**
 * Return the ecampus or cascades logo if the user is identified as belonging to one of those campuses
 * @param user the currently logged in user
 */
const campusLogo = (user: Types.User) => {
  const { campusCode } = usersCampus(user);
  switch (campusCode) {
    case CAMPUS_CODES.ecampus:
      return ecampusLogo;
    case CAMPUS_CODES.bend:
      return cascadesLogo;
    default:
      return logo;
  }
};

const mainTitle = user => {
  let title = 'Student';
  if (!user) return title;
  if (UserUtil.getAffiliation(user) === User.AFFILIATIONS.employee) {
    title = 'Employee';
  }
  return title + ' Dashboard';
};

const Header = () => {
  const { user } = useContext(AppContext);
  const title = mainTitle(user.data);
  return (
    <>
      <HeaderWrapper>
        <Logo
          data-testid="app-header-logo"
          src={campusLogo(user.data)}
          alt="Oregon State University"
        />
        <SiteTitle>
          {title}
          <BetaBadge title={title} />
        </SiteTitle>
        <HeaderNav />
      </HeaderWrapper>
      <Navigation>
        <MainNav />
      </Navigation>
    </>
  );
};

export default Header;
