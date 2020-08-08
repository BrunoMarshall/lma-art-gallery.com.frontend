import * as React from 'react';
import { Box } from 'grommet';
import { Title, Text, Button } from 'components/Base';
import { observer } from 'mobx-react-lite';
import * as styles from './styles.styl';
import cn from 'classnames';
import { useStores } from '../../stores';
import { formatWithSixDecimals, formatWithTwoDecimals } from '../../utils';
import { useCallback } from 'react';
import { AuthWarning } from '../../components/AuthWarning';
import { GenerateDai } from '../OpenVaultModal/GenerateDai';

export const Dashboard = observer(() => {
  const { openVault, user, actionModals } = useStores();

  const { ink: ones, art: dai } = user.vat;
  const { totalFeeds } = openVault;

  const openVaultHandler = useCallback(async () => {
    if (!user.isAuthorized) {
      if (!user.isOneWallet) {
        return actionModals.open(() => <AuthWarning />, {
          title: '',
          applyText: 'Got it',
          closeText: '',
          noValidation: true,
          width: '500px',
          showOther: true,
          onApply: () => {
            return Promise.resolve();
          },
        });
      } else {
        await user.signIn();
      }
    }

    actionModals.open(GenerateDai, {
      title: '',
      applyText: 'Open Vault',
      closeText: 'Cancel',
      noValidation: true,
      width: '1000px',
      showOther: true,
      onApply: data => openVault.open(data.amount, data.amountDai),
      onClose: () => openVault.clear(),
    });
  }, []);

  return (
    <Box direction="row" justify="between" margin={{ top: '28px' }} wrap>
      <Box direction="column" className={styles.widget}>
        <Title>Liquidation price</Title>

        <Box className={styles.container}>
          <Box className={cn(styles.row, styles.first)}>
            <Text size="large" bold={true}>
              {formatWithSixDecimals(totalFeeds.liquidationPrice)} USDT
            </Text>
          </Box>

          <Box className={cn(styles.row, styles.underline)}>
            <Text>Current price</Text>

            <Box direction="row">
              <Box className={styles.priceColumn}>
                <Text>
                  {formatWithSixDecimals(openVault.currentOnePrice)} USDT
                </Text>
              </Box>
            </Box>
          </Box>

          <Box className={styles.row}>
            <Text>Liquidation penalty</Text>

            <Box direction="row">
              <Box className={styles.priceColumn}>
                <Text>13%</Text>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      <Box direction="column" className={styles.widget}>
        <Title>Collateralization ratio</Title>

        <Box className={styles.container}>
          <Box className={cn(styles.row, styles.first)}>
            <Text size="large" bold={true}>
              {formatWithTwoDecimals(totalFeeds.сollateralizationRatio)} %
            </Text>
          </Box>

          <Box className={cn(styles.row, styles.underline)}>
            <Text>Minimum ratio</Text>

            <Box direction="row">
              <Box className={styles.priceColumn}>
                <Text>150.00 %</Text>
              </Box>
            </Box>
          </Box>

          <Box className={styles.row}>
            <Text>Stability fee</Text>

            <Box direction="row">
              <Box className={styles.priceColumn}>
                <Text>2.5%</Text>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      <Box direction="column" className={styles.widget}>
        <Title>ONE locked</Title>

        <Box className={styles.container}>
          <Box className={cn(styles.row, styles.underline)}>
            <Text>ONE locked</Text>

            <Box direction="row">
              <Box className={styles.priceColumn}>
                <Text>{formatWithTwoDecimals(ones)} ONE</Text>
                <Text className={styles.smallText}>
                  {formatWithTwoDecimals(
                    Number(ones) * openVault.currentOnePrice,
                  )}{' '}
                  USDT
                </Text>
              </Box>
              <Button onClick={() => openVaultHandler()}>Deposit</Button>
            </Box>
          </Box>

          <Box className={styles.row}>
            <Text>Able to withdraw</Text>

            <Box direction="row">
              <Box className={styles.priceColumn}>
                <Text>
                  {formatWithTwoDecimals(totalFeeds.ableToWithDraw)} ONE
                </Text>
                <Text className={styles.smallText}>
                  {formatWithTwoDecimals(
                    totalFeeds.ableToWithDraw * openVault.currentOnePrice,
                  )}{' '}
                  USDT
                </Text>
              </Box>
              <Button disabled={true} onClick={() => {}}>
                Withdraw
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>

      <Box direction="column" className={styles.widget}>
        <Title>Outstanding Dai debt</Title>

        <Box className={styles.container}>
          <Box className={cn(styles.row, styles.underline)}>
            <Text>Outstanding Dai debt</Text>

            <Box direction="row">
              <Box className={styles.priceColumn}>
                <Text>{formatWithTwoDecimals(dai)} DAI</Text>
              </Box>
              <Button disabled={true} onClick={() => {}}>
                Pay back
              </Button>
            </Box>
          </Box>

          <Box className={styles.row}>
            <Text>Available to generate</Text>

            <Box direction="row">
              <Box className={styles.priceColumn}>
                <Text>
                  {formatWithTwoDecimals(totalFeeds.ableToGenerate)} DAI
                </Text>
              </Box>
              <Button disabled={true} onClick={() => {}}>
                Generate
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
});
