import React, { useContext, useState, useEffect, useRef } from 'react';
import styled, { ThemeContext } from 'styled-components/macro';
import { fal, faHeart } from '@fortawesome/pro-light-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';
import Checkbox from '@material-ui/core/Checkbox';
import { Resources, Status, useStatus } from '@osu-wams/hooks';
import { Types } from '@osu-wams/lib';
import { ListItemFlex, ListItemResourceLink, ListItemContentLinkName } from 'src/ui/List';
import { IconLookup } from './resources-utils';
import Icon from 'src/ui/Icon';
import { TrendingEvent } from './GATrendingResource';
import { Event } from 'src/util/gaTracking';
import { userState } from 'src/state';
import { useRecoilValue } from 'recoil';
import { ExternalLink } from '../../ui/Link';
import { CloseButton } from '../../ui/Button';
import { RichTextContent } from '../../ui/RichText';
import MyDialog from '../../ui/MyDialog';
import { faExclamationCircle as faExclamationCircleHollow } from '@fortawesome/pro-light-svg-icons';
import { faExclamationCircle as faExclamationCircleSolid } from '@fortawesome/pro-solid-svg-icons';
import { fontSize } from 'src/theme';
import { format } from 'src/util/helpers';

// Adds all font awesome icons so we can call them by name (coming from Drupal API)
library.add(fal, fab);

const FooterLinks = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  align-items: baseline;
`;

const ResourceItem = ({ resource, event }: { resource: Types.Resource; event: any }) => {
  const themeContext = useContext(ThemeContext);
  const user = useRecoilValue(userState);
  const [favs, setFav] = useState(false);

  const isFavorite = (resId: string, favs: Types.FavoriteResource[]) => {
    const res: Types.FavoriteResource | undefined = favs.find(
      (r: Types.FavoriteResource) => r.resourceId === resId
    );
    return res?.active || false;
  };

  useEffect(() => {
    if (resource.id && user.data.favoriteResources) {
      setFav(isFavorite(resource.id, user.data.favoriteResources));
    }
  }, [user.data.favoriteResources, resource.id]);

  const favoriteLabelText = (currentFavState: boolean) => {
    return currentFavState
      ? `Remove ${resource.title} link from your favorite resources`
      : `Add ${resource.title} link to your favorite resources`;
  };

  // Adds or removes a resource from FavoriteResource and refreshes the cache to get new list
  const updateFavorites = async () => {
    await Resources.postFavorite(resource.id, !favs, 0);
    if (user.refreshFavorites) await user.refreshFavorites();
    Event('favorite-resource', resource.id, favoriteLabelText(favs));
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFav(event.target.checked);
    updateFavorites();
  };

  const { data, isLoading, isSuccess } = useStatus();
  const [showDialog, setShowDialog] = useState(false);
  const [itSystemError, setItSystemError] = useState(false);
  const [systemCheckedAt, setSystemCheckedAt] = useState(new Date());
  const cancelRef = useRef<HTMLButtonElement>(null);
  const open = () => setShowDialog(true);
  const close = () => setShowDialog(false);

  useEffect(() => {
    if (isSuccess) {
      // look for the resource's corresponding IT system
      if (resource.hasOwnProperty('itSystem') && data !== undefined) {
        var result = data.find((system) => system.name === resource.itSystem);
        // if resource HAS an IT system and its status isn't 1, alert user
        // if (resource.itSystem && result && result[0].status !== 1) {

        if (resource.itSystem && result !== undefined && result.status === 1) {
          //if (resource.itSystem) {
          // use this version for testing; first need to add stuff into mock data so that we can test clicking on Box
          setItSystemError(true);
        }
        // update date checked time
        setSystemCheckedAt(new Date());
      }
    }
  }, [isSuccess]);

  return (
    <>
      <ListItemFlex>
        <ListItemResourceLink
          onClick={() => {
            // if resource's IT system has an error, open the dialog box
            if (itSystemError) {
              open();
            }
            // else, open link
            else {
              window.open(resource.link); // should I change this? - kristina 4/6/21
              close();
            }
            event();
            if (!resource.excludeTrending) {
              TrendingEvent(resource, user.data);
            }
          }}
        >
          {IconLookup(resource.iconName, themeContext.features.resources.icon.color)}
          <ListItemContentLinkName>{resource.title}</ListItemContentLinkName>
          {itSystemError && (
            <Icon
              fontSize={fontSize[18]}
              icon={faExclamationCircleSolid}
              color={themeContext.features.itStatus.item.icon.partialOutage}
              style={{ marginLeft: '5px', fontSize: '18px!important' }}
              data-testid="warning-icon"
            />
          )}
        </ListItemResourceLink>

        <Checkbox
          icon={<Icon icon={faHeart} />}
          checkedIcon={<Icon icon={faHeart} color="#d73f09" />}
          value={resource.id}
          checked={favs}
          onChange={handleChange}
          inputProps={{
            'aria-label': favoriteLabelText(favs),
          }}
        />
      </ListItemFlex>

      {showDialog && (
        <MyDialog isOpen={showDialog} onDismiss={close} aria-labelledby="message-title">
          <CloseButton onClick={close} />
          <div>
            <Icon
              fontSize={fontSize[24]}
              icon={faExclamationCircleHollow}
              color={themeContext.features.itStatus.item.icon.partialOutage}
              style={{ display: 'inline-block', paddingRight: '5px' }}
            />{' '}
            <h2 id="message-title" style={{ fontSize: fontSize[18], display: 'inline-block' }}>
              This resource may be unavailable.
            </h2>
          </div>
          <div>
            {resource.title} •{' '}
            {systemCheckedAt.toLocaleString('en-US', {
              hour: 'numeric',
              minute: 'numeric',
              hour12: true,
            }) +
              ' at ' +
              format(systemCheckedAt)}
          </div>
          <RichTextContent
            dangerouslySetInnerHTML={{
              __html: 'We think there might be something wrong with this link. Open anyways?',
            }}
          ></RichTextContent>
          <FooterLinks>
            <div></div>
            <ExternalLink href={resource.link} onClick={close}>
              Continue to resource
            </ExternalLink>
          </FooterLinks>
        </MyDialog>
      )}
    </>
  );
};

export { ResourceItem };
