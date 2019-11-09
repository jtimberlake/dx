import React from 'react';
import styled from 'styled-components';
import { theme, Color } from '../theme';

type SpacedList = {
  spaced?: boolean;
};

const List = styled.ul`
  color: ${Color['neutral-700']};
  text-decoration: none;
  padding: 0;
  margin: 0;
`;

const ListItem = styled.li<SpacedList>`
  list-style-type: none;
  &:last-child {
    margin-bottom: ${props => (props.spaced ? 0 : theme.spacing.unit * 2)}px;
  }
  & > button {
    /* cursor only on buttons, not divs */
    cursor: pointer;
  }
`;

const ListItemContent = styled.div<SpacedList>`
  width: 100%;
  background: transparent;
  display: flex;
  justify-content: flex-start;
  flex-wrap: nowrap;
  align-items: center;
  border: none;
  border-radius: 8px;
  transition: all 150ms ease-in-out 0s;
  padding: ${props => (props.spaced ? theme.spacing.unit * 2 : 12)}px
    ${props => (props.spaced ? theme.spacing.unit * 2 : 12)}px;
  svg,
  img {
    height: 3rem;
    font-size: 2.4rem;
    width: 3rem !important; /* overwrite fontawsome class to have equal spacing of icons */
    & + div {
      padding-left: 1.5rem;
    }
  }
  text-decoration: none;
`;

type TLink = React.HTMLProps<HTMLAnchorElement>;

const ListItemContentLink = styled(ListItemContent).attrs({ as: 'a' })<TLink>`
  &:hover {
    & > svg,
    & > div {
      color: ${Color['orange-400']};
    }
    box-shadow: rgba(66, 62, 60, 0.1) 0px 10px 16px, rgba(105, 99, 97, 0.05) 0px 3px 16px;
    transform: translateY(-4px);
  }
`;

const ListItemContentButton = styled(ListItemContentLink).attrs({ as: 'button' })``;

const ListItemText = styled.div`
  padding-right: 1.5rem;
  flex: 2;
  text-align: left;
`;

const ListItemHeader = styled.h4`
  color: ${Color['neutral-700']};
  margin: 0;
  font-weight: normal;
`;

const ListItemDescription = styled.div<{ fontSize?: string; color?: string }>`
  color: ${props => (props.color ? props.color : Color['neutral-550'])};
  font-size: ${props => (props.fontSize ? props.fontSize : theme.fontSize[14])};
  line-height: 1.6rem;
`;

const ListItemLeadText = styled.div`
  line-height: ${theme.fontSize[14]};
  text-align: center;
  padding: 0 ${theme.spacing.unit * 2}px 0 0;
  color: ${Color['orange-400']};
  width: ${theme.fontSize[58]};
  strong {
    line-height: ${theme.fontSize[20]};
    font-size: ${theme.fontSize[20]};
  }
`;

export {
  List,
  ListItem,
  ListItemContent,
  ListItemContentButton,
  ListItemContentLink,
  ListItemText,
  ListItemHeader,
  ListItemDescription,
  ListItemLeadText
};
