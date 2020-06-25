import * as React from 'react';
import { Box } from 'grommet';
import { DisableWrap, Icon, Text } from 'components/Base';
import { observer } from 'mobx-react-lite';
import * as styles from './card.styl';
import { IEmptyPlayerCard, IPlayerCard } from 'stores/SoccerPlayersList';
import { ones, truncateAddressString } from '../../utils';
import { getBech32Address } from '../../blockchain';
import { useCallback } from 'react';
import { useStores } from 'stores';
import { BuyPlayerModal } from './BuyPlayerModal';
import { AuthWarning } from '../../components/AuthWarning';

const DataItem = (props: {
  text: any;
  label: string;
  icon: string;
  iconSize: string;
  color?: string;
}) => {
  return (
    <Box direction="row" justify="between" gap="10px">
      <Box direction="row" justify="start" align="center" gap="5px">
        <Icon
          glyph={props.icon}
          size={props.iconSize}
          color={props.color || '#1c2a5e'}
          style={{ marginBottom: 2, width: 20 }}
        />
        <Text color="#1c2a5e" size={'small'}>
          {props.label}
        </Text>
      </Box>
      <Text color={props.color || '#1c2a5e'} size={'small'} bold={true}>
        {props.text}
      </Text>
    </Box>
  );
};

export interface IPlayerCardProps {
  player?: IPlayerCard;
  emptyPlayer?: IEmptyPlayerCard;
}

export const PlayerCard = observer<IPlayerCardProps>(props => {
  const { actionModals, buyPlayer, user } = useStores();

  const bech32Owner = props.player ? getBech32Address(props.player.owner) : '';

  const buyPlayerHandler = useCallback(async () => {
    if (!user.isAuthorized) {
      if (!user.isMathWallet) {
        return actionModals.open(() => <AuthWarning />, {
          title: '',
          applyText: 'Got it',
          closeText: '',
          noValidation: true,
          width: '500px',
          showOther: true,
          onApply: () => Promise.resolve(),
        });
      } else {
        await user.signIn();
      }
    }

    if (user.address === bech32Owner) {
      return;
    }

    await buyPlayer.initPlayer(props.player);

    actionModals.open(
      () => <BuyPlayerModal id={props.player.internalPlayerId} />,
      {
        title: '',
        applyText: 'Buy Player Card',
        closeText: 'Cancel',
        noValidation: true,
        width: '1000px',
        showOther: true,
        onApply: () => buyPlayer.buy(),
        onClose: () => buyPlayer.clear(),
      },
    );
  }, []);

  return (
    <Box
      className={styles.cardContainer}
      height="100%"
      align="center"
      background=""
    >
      <img
        width="100%"
        src={`/players/${
          props.player
            ? props.player.internalPlayerId
            : props.emptyPlayer.internalPlayerId
        }.jpg`}
      />

      {props.player ? (
        <Box className={styles.infoBlock} fill={true} gap="10px" pad="medium">
          <DataItem
            icon="Price"
            iconSize="16px"
            text={
              (props.player ? ones(props.player.sellingPrice) : '...') + ' ONEs'
            }
            label="Price:"
          />
          <DataItem
            icon="User"
            iconSize="16px"
            text={props.player ? truncateAddressString(bech32Owner) : '...'}
            label="Owner:"
          />
          <DataItem
            icon="Refresh"
            iconSize="14px"
            text={props.player ? props.player.transactions : '...'}
            label="Transactions:"
          />
        </Box>
      ) : (
        <Box
          className={styles.infoBlockEmpty}
          fill={true}
          gap="10px"
          pad="medium"
          justify="center"
        >
          <DataItem
            icon="Refresh"
            iconSize="14px"
            text={''}
            label="Loading data from blockchain..."
          />
        </Box>
      )}

      <DisableWrap disabled={!props.player}>
        {user.address === bech32Owner ? (
          <Box className={styles.buyButtonMy} fill={true}>
            <Text color="white" size={'medium'}>
              It is your card
            </Text>
          </Box>
        ) : (
          <Box
            className={styles.buyButton}
            fill={true}
            onClick={buyPlayerHandler}
          >
            <Text color="white" size={'medium'}>
              Buy this contract
            </Text>
          </Box>
        )}
      </DisableWrap>
    </Box>
  );
});
