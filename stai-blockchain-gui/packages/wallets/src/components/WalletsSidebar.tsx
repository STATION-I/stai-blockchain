import React, { useMemo } from 'react';
import { Trans } from '@lingui/macro';
import { orderBy } from 'lodash';
import { useNavigate, useParams } from 'react-router';
import { Box, Typography, Button } from '@mui/material';
import {
  Flex,
  CardListItem,
  useOpenDialog,
  Link,
  useColorModeValue,
  useOpenExternal,
  FormatLargeNumber,
} from '@stai/core';
import {
  useGetLoggedInFingerprintQuery,
  useGetPrivateKeyQuery,
  useGetWalletsQuery,
} from '@stai/api-react';
import { WalletType } from '@stai/api';
import styled from 'styled-components';
import WalletIcon from './WalletIcon';
import getWalletPrimaryTitle from '../utils/getWalletPrimaryTitle';
import WalletsManageTokens from './WalletsManageTokens';
import useHiddenWallet from '../hooks/useHiddenWallet';
import WalletEmptyDialog from './WalletEmptyDialog';

const StyledRoot = styled(Box)`
  min-width: 390px;
  height: 100%;
  display: flex;
  padding-top: ${({ theme }) => `${theme.spacing(3)}`};
`;

const StyledContent = styled(Box)`
  padding-left: ${({ theme }) => theme.spacing(3)};
  padding-right: ${({ theme }) => theme.spacing(3)};
  margin-right: ${({ theme }) => theme.spacing(2)};
  min-height: ${({ theme }) => theme.spacing(5)};
  overflow-y: overlay;
`;

const StyledBody = styled(Box)`
  flex-grow: 1;
  position: relative;
`;

const TokensInfo = styled.div`
  float: right;
  border: ${({ theme }) => `1px solid ${useColorModeValue(theme, 'border')}`};
  height: 30px;
  padding: 0px 5px;
  border-radius: 5px;
  cursor: pointer;
`;

const StyledItemsContainer = styled(Flex)`
  flex-direction: column;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  padding-bottom: ${({ theme }) => theme.spacing(6)};
`;

const ContentStyled = styled.div`
  max-width: 500px;
  text-align: center;
  padding: 5px 20px;
`;

const CatTwoIconStyled = styled.div`
  position: relative;
  background: #d9d9d9;
  width: 127px;
  height: 103px;
  border-radius: 50%;
  margin: 0 auto 15px;
  > div {
    width: 9px;
    height: 9px;
    background-color: #c178aa;
    border-radius: 50%;
  }
  > div:first-child {
    position: absolute;
    left: 62px;
    top: 25px;
  }
  > div:nth-child(2) {
    position: absolute;
    left: 78px;
    top: 25px;
  }
`;

const ActionsStyled = styled.div`
  margin: 25px;
  display: inline-block;
`;

export default function WalletsSidebar() {
  const navigate = useNavigate();
  const { walletId } = useParams();
  const { data: wallets, isLoading } = useGetWalletsQuery();
  const {
    isHidden,
    hidden,
    isLoading: isLoadingHiddenWallet,
  } = useHiddenWallet();

  const openDialog = useOpenDialog();

  const openExternal = useOpenExternal();

  const { data: fingerprint, isLoading: isLoadingFingerprint } =
    useGetLoggedInFingerprintQuery();

  const { data: privateKey, isLoading: isLoadingPrivateKey } =
    useGetPrivateKeyQuery({
      fingerprint,
    });

  function handleOpenBlogPost() {
    openExternal('https://www.chia.net/cat2blog');
  }

  function handleSelectWallet(walletId: number) {
    navigate(`/dashboard/wallets/${walletId}`);
  }

  const items = useMemo(() => {
    if (isLoading || isLoadingHiddenWallet) {
      return [];
    }

    const orderedWallets = orderBy(wallets, ['type', 'name'], ['asc', 'asc']);

    return orderedWallets
      .filter(
        wallet =>
          [WalletType.STANDARD_WALLET, WalletType.CAT].includes(wallet.type) &&
          !isHidden(wallet.id)
      )
      .map(wallet => {
        const primaryTitle = getWalletPrimaryTitle(wallet);

        function handleSelect() {
          handleSelectWallet(wallet.id);
        }

        return (
          <CardListItem
            onSelect={handleSelect}
            key={wallet.id}
            selected={wallet.id === Number(walletId)}
          >
            <Flex flexDirection="column">
              <Typography>{primaryTitle}</Typography>
              <WalletIcon
                wallet={wallet}
                color="textSecondary"
                variant="caption"
              />
            </Flex>
          </CardListItem>
        );
      });
  }, [wallets, walletId, isLoading, hidden, isLoadingHiddenWallet]);

  return (
    <StyledRoot>
      <Flex gap={3} flexDirection="column" width="100%">
        <StyledContent>
          <Typography variant="h5">
            <Trans>Tokens</Trans>
          </Typography>
        </StyledContent>
        <StyledBody>
          <StyledItemsContainer>
            <StyledContent>
              <Flex gap={1} flexDirection="column">
                {items}
              </Flex>
            </StyledContent>
          </StyledItemsContainer>
          <WalletsManageTokens />
        </StyledBody>
      </Flex>
    </StyledRoot>
  );
}
