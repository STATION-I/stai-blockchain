import React, { useMemo } from 'react';
import { Trans, t } from '@lingui/macro';
import { useLocalStorage } from '@rehooks/local-storage';
import {
  ButtonLoading,
  CopyToClipboard,
  DialogActions,
  Flex,
  TooltipIcon,
  useOpenDialog,
  useShowError,
  useOpenExternal,
} from '@stai/core';
import { OfferTradeRecord, toBech32m } from '@stai/api';
import {
  Button,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  Divider,
  FormControlLabel,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';
import {
  offerContainsAssetOfType,
  shortSummaryForOffer,
  suggestedFilenameForOffer,
} from './utils';
import useAssetIdName, { AssetIdMapEntry } from '../../hooks/useAssetIdName';
import { Shell } from 'electron';
import { NFTOfferSummary } from './NFTOfferViewer';
import OfferLocalStorageKeys from './OfferLocalStorage';
import OfferSummary from './OfferSummary';
import child_process from 'child_process';
import fs from 'fs';
import path from 'path';

/* ========================================================================== */

enum OfferSharingService {
}

enum OfferSharingCapability {
  Token = 'Token',
  NFT = 'NFT',
}

interface OfferSharingProvider {
  service: OfferSharingService;
  name: string;
  capabilities: OfferSharingCapability[];
}

type CommonOfferProps = {
  offerRecord: OfferTradeRecord;
  offerData: string;
  testnet: boolean;
};

type CommonDialogProps = {
  open: boolean;
  onClose: (value: boolean) => void;
};

type OfferShareServiceDialogProps = CommonOfferProps & CommonDialogProps;

const testnetDummyHost = 'offers-api-sim.STATION-I.de';

const OfferSharingProviders: {
  [key in OfferSharingService]: OfferSharingProvider;
} = {
};

/* ========================================================================== */

async function writeTempOfferFile(
  offerData: string,
  filename: string,
): Promise<string> {
  const ipcRenderer = (window as any).ipcRenderer;
  const tempRoot = await ipcRenderer?.invoke('getTempDir');
  const tempPath = fs.mkdtempSync(path.join(tempRoot, 'offer'));
  const filePath = path.join(tempPath, filename);

  fs.writeFileSync(filePath, offerData);

  return filePath;
}

/* ========================================================================== */

async function postToDexie(
  offerData: string,
  testnet: boolean,
): Promise<string> {
  const ipcRenderer = (window as any).ipcRenderer;
  const requestOptions = {
    method: 'POST',
    protocol: 'https:',
    hostname: testnet ? 'testnet.dexie.space' : 'dexie.space',
    port: 443,
    path: '/v1/offers',
  };
  const requestHeaders = {
    'Content-Type': 'application/json',
  };
  const requestData = JSON.stringify({ offer: offerData });
  const { err, statusCode, statusMessage, responseBody } =
    await ipcRenderer.invoke(
      'fetchTextResponse',
      requestOptions,
      requestHeaders,
      requestData,
    );

  if (err || (statusCode !== 200 && statusCode !== 400)) {
    const error = new Error(
      `Dexie upload failed: ${err}, statusCode=${statusCode}, statusMessage=${statusMessage}, response=${responseBody}`,
    );
    throw error;
  }

  console.log('Dexie upload completed');
  const { id } = JSON.parse(responseBody);

  return `https://${testnet ? 'testnet.' : ''}dexie.space/offers/${id}`;
}

async function postToMintGarden(
  offerData: string,
  testnet: boolean,
): Promise<string> {
  const ipcRenderer = (window as any).ipcRenderer;
  const requestOptions = {
    method: 'POST',
    protocol: 'https:',
    hostname: testnet ? 'api.testnet.mintgarden.io' : 'api.mintgarden.io',
    port: 443,
    path: '/offer',
  };
  const requestHeaders = {
    'Content-Type': 'application/json',
  };
  const requestData = JSON.stringify({ offer: offerData });
  const { err, statusCode, statusMessage, responseBody } =
    await ipcRenderer.invoke(
      'fetchTextResponse',
      requestOptions,
      requestHeaders,
      requestData,
    );

  if (err || (statusCode !== 200 && statusCode !== 400)) {
    const error = new Error(
      `MintGarden upload failed: ${err}, statusCode=${statusCode}, statusMessage=${statusMessage}, response=${responseBody}`,
    );
    throw error;
  }

  console.log('MintGarden upload completed');

  const {
    offer: { id },
  } = JSON.parse(responseBody);

  return `https://${testnet ? 'testnet.' : ''}mintgarden.io/offers/${id}`;
}

// Posts the offer data to OfferBin and returns a URL to the offer.
async function postToOfferBin(
  offerData: string,
  sharePrivately: boolean,
  testnet: boolean,
): Promise<string> {
  const ipcRenderer = (window as any).ipcRenderer;
  const requestOptions = {
    method: 'POST',
    protocol: 'https:',
    hostname: testnet ? testnetDummyHost : 'api.offerbin.io',
    port: 443,
    path: testnet
      ? '/offerbin' + (sharePrivately ? '?private=true' : '')
      : '/upload' + (sharePrivately ? '?private=true' : ''),
  };
  const requestHeaders = {
    'Content-Type': 'application/text',
  };
  const requestData = offerData;
  const { err, statusCode, statusMessage, responseBody } =
    await ipcRenderer?.invoke(
      'fetchTextResponse',
      requestOptions,
      requestHeaders,
      requestData,
    );

  if (err || statusCode !== 200) {
    const error = new Error(
      `OfferBin upload failed: ${err}, statusCode=${statusCode}, statusMessage=${statusMessage}, response=${responseBody}`,
    );
    throw error;
  }

  console.log('OfferBin upload completed');

  if (testnet) {
    return 'https://www.STATION-I.de/offers';
  }

  const { hash } = JSON.parse(responseBody);

  return `https://offerbin.io/offer/${hash}`;
}

enum HashgreenErrorCodes {
  OFFERED_AMOUNT_TOO_SMALL = 40020, // The offered amount is too small
  MARKET_NOT_FOUND = 50029, // Pairing doesn't exist e.g. STAI/RandoCoin
  OFFER_FILE_EXISTS = 50037, // Offer already shared
  COINS_ALREADY_COMMITTED = 50041, // Coins in the offer are already committed in another offer
}

async function postToHashgreen(
  offerData: string,
  testnet: boolean,
): Promise<string> {
  const ipcRenderer = (window as any).ipcRenderer;
  const requestOptions = {
    method: 'POST',
    protocol: 'https:',
    hostname: testnet ? testnetDummyHost : 'hash.green',
    port: 443,
    path: testnet ? '/hashgreen' : '/api/v1/orders',
  };
  const requestHeaders = {
    accept: 'application/json',
    'Content-Type': 'application/x-www-form-urlencoded',
  };
  const requestData = `offer=${offerData}`;
  const { err, statusCode, statusMessage, responseBody } =
    await ipcRenderer?.invoke(
      'fetchTextResponse',
      requestOptions,
      requestHeaders,
      requestData,
    );

  if (err) {
    const error = new Error(
      `Failed to post offer to hash.green: ${err}, statusCode=${statusCode}, statusMessage=${statusMessage}`,
    );
    throw error;
  }

  if (statusCode === 200) {
    console.log('Hashgreen upload completed');

    if (testnet) {
      return 'https://www.STATION-I.de/offers';
    }

    const jsonObj = JSON.parse(responseBody);
    const { data } = jsonObj;
    const id = data?.id;

    if (id) {
      return `https://hash.green/dex?order=${id}`;
    } else {
      const error = new Error(
        `Hashgreen response missing data.id: ${responseBody}`,
      );
      throw error;
    }
  } else {
    const jsonObj = JSON.parse(responseBody);
    const { code, msg, data } = jsonObj;

    if (code === HashgreenErrorCodes.OFFER_FILE_EXISTS && data) {
      return `https://hash.green/dex?order=${data}`;
    } else {
      console.log(`Upload failure response: ${responseBody}`);
      switch (code) {
        case HashgreenErrorCodes.MARKET_NOT_FOUND:
          throw new Error(
            `Hashgreen upload rejected. Pairing is not supported: ${msg}`,
          );
        case HashgreenErrorCodes.COINS_ALREADY_COMMITTED:
          throw new Error(
            `Hashgreen upload rejected. Offer contains coins that are in use by another offer: ${msg}`,
          );
        case HashgreenErrorCodes.OFFERED_AMOUNT_TOO_SMALL:
          throw new Error(
            `Hashgreen upload rejected. Offer amount is too small: ${msg}`,
          );
        default:
          throw new Error(
            `Hashgreen upload rejected: code=${code} msg=${msg} data=${data}`,
          );
      }
    }
  }
}

enum DiscordCLIActions {
  JOIN_TEAM = 'JOIN_TEAM',
  JOIN_CHANNEL = 'JOIN_CHANNEL',
  UPLOAD_OFFER = 'UPLOAD_OFFER',
  CHECK_TEAM_MEMBERSHIP = 'CHECK_TEAM_MEMBERSHIP',
}

type DiscordCLIRequest = {
  action: DiscordCLIActions;
  uploadArgs?: {
    title: string;
    filePath: string;
  };
  teamName: string;
  channelName: string;
};

const DiscordTeamName = 'stai_offers';
const DiscordChannelName = 'offers-trading';

async function execDiscordCLI(request: DiscordCLIRequest): Promise<boolean> {
  const { action, uploadArgs, teamName, channelName } = request;

  return new Promise((resolve, reject) => {
    try {
      const options: any = {};

      if (process.platform === 'darwin') {
        const env = Object.assign({}, process.env);

        // Add /usr/local/bin and a direct path to the keybase binary on macOS.
        // Without these additions, the keybase binary may not be found.
        env.PATH = `${env.PATH}:/usr/local/bin:/Applications/Discord.app/Contents/SharedSupport/bin`;

        options['env'] = env;
      }

      let command: string | undefined = undefined;

      switch (action) {
        case DiscordCLIActions.JOIN_TEAM:
          command = `keybase team request-access ${teamName}`;
          break;
        case DiscordCLIActions.JOIN_CHANNEL:
          command = `keybase chat join-channel ${teamName} '#${channelName}'`;
          break;
        case DiscordCLIActions.UPLOAD_OFFER:
          const { title, filePath } = uploadArgs!;
          if (title && filePath) {
            command = `keybase chat upload "${teamName}" --channel "${channelName}" --title "${title}" "${filePath}"`;
          } else {
            reject(new Error(`Missing title or filePath in uploadArgs`));
          }
          break;
        case DiscordCLIActions.CHECK_TEAM_MEMBERSHIP:
          command = 'keybase team list-memberships';
          break;
        default:
          reject(new Error(`Unknown DiscordCLI action: ${action}`));
          break;
      }

      if (command) {
        child_process.exec(command, options, (error, stdout, stderr) => {
          if (error) {
            console.error(`Discord error: ${error}`);
            switch (action) {
              case DiscordCLIActions.CHECK_TEAM_MEMBERSHIP:
                resolve(stdout.indexOf(`${teamName}`) === 0);
                break;
              case DiscordCLIActions.JOIN_TEAM:
                resolve(stderr.indexOf('(code 2665)') !== -1);
                break;
              default:
                if (stderr.indexOf('(code 2623)') !== -1) {
                  resolve(false);
                } else {
                  reject(
                    new Error(t`Failed to execute Discord command: ${stderr}`),
                  );
                }
            }
          }

          resolve(true);
        });
      } else {
        reject(new Error(`Missing command for action: ${action}`));
      }
    } catch (error) {
      console.error(error);
      reject(error);
    }
  });
}

async function postToDiscord(
  offerRecord: OfferTradeRecord,
  offerData: string,
  teamName: string,
  channelName: string,
  lookupByAssetId: (assetId: string) => AssetIdMapEntry | undefined,
): Promise<boolean> {
  const filename = suggestedFilenameForOffer(
    offerRecord.summary,
    lookupByAssetId,
  );
  const summary = shortSummaryForOffer(offerRecord.summary, lookupByAssetId);

  let filePath = '';
  let success = false;

  filePath = await writeTempOfferFile(offerData, filename);

  try {
    success = await execDiscordCLI({
      action: DiscordCLIActions.UPLOAD_OFFER,
      uploadArgs: { title: summary, filePath },
      teamName,
      channelName,
    });
  } finally {
    if (filePath) {
      fs.unlinkSync(filePath);
    }
  }
  return success;
}

type PostToOfferpoolResponse = {
  success: boolean;
  error_message?: string;
};

// Posts the offer data to offerpool and returns success and an error_message on failure
async function postToOfferpool(
  offerData: string,
  testnet: boolean,
): Promise<PostToOfferpoolResponse> {
  const ipcRenderer = (window as any).ipcRenderer;
  const requestOptions = {
    method: 'POST',
    protocol: 'https:',
    hostname: testnet ? testnetDummyHost : 'offerpool.io',
    port: 443,
    path: testnet ? '/offerpool' : '/api/v1/offers',
  };
  const requestHeaders = {
    'Content-Type': 'application/json',
  };
  const requestData = JSON.stringify({ offer: offerData });
  const { err, statusCode, statusMessage, responseBody } =
    await ipcRenderer.invoke(
      'fetchTextResponse',
      requestOptions,
      requestHeaders,
      requestData,
    );

  if (err || (statusCode !== 200 && statusCode !== 400)) {
    const error = new Error(
      `offerpool upload failed: ${err}, statusCode=${statusCode}, statusMessage=${statusMessage}, response=${responseBody}`,
    );
    throw error;
  }

  console.log('offerpool upload completed');

  if (testnet) {
    return { success: true };
  }

  return JSON.parse(responseBody);
}

/* ========================================================================== */

function OfferShareDexieDialog(props: OfferShareServiceDialogProps) {
  const { offerRecord, offerData, testnet, onClose, open } = props;
  const openExternal = useOpenExternal();
  const [sharedURL, setSharedURL] = React.useState('');

  function handleClose() {
    onClose(false);
  }

  async function handleConfirm() {
    const url = await postToDexie(offerData, testnet);
    console.log(`Dexie URL: ${url}`);
    setSharedURL(url);
  }

  if (sharedURL) {
    return (
      <Dialog
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="xs"
        open={open}
        onClose={handleClose}
        fullWidth
      >
        <DialogTitle>
          <Trans>Offer Shared</Trans>
        </DialogTitle>
        <DialogContent dividers>
          <Flex flexDirection="column" gap={3} sx={{ paddingTop: '1em' }}>
            <TextField
              label={<Trans>Dexie URL</Trans>}
              value={sharedURL}
              variant="filled"
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <InputAdornment position="end">
                    <CopyToClipboard value={sharedURL} />
                  </InputAdornment>
                ),
              }}
              fullWidth
            />
            <Flex>
              <Button
                variant="outlined"
                onClick={() => openExternal(sharedURL)}
              >
                <Trans>View on Dexie</Trans>
              </Button>
            </Flex>
          </Flex>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary" variant="contained">
            <Trans>Close</Trans>
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <OfferShareConfirmationDialog
      offerRecord={offerRecord}
      offerData={offerData}
      testnet={testnet}
      title={<Trans>Share on Dexie</Trans>}
      onConfirm={handleConfirm}
      open={open}
      onClose={onClose}
    />
  );
}

OfferShareDexieDialog.defaultProps = {
  open: false,
  onClose: () => {},
};

function OfferShareMintGardenDialog(props: OfferShareServiceDialogProps) {
  const { offerRecord, offerData, testnet, onClose, open } = props;
  const openExternal = useOpenExternal();
  const [sharedURL, setSharedURL] = React.useState('');

  function handleClose() {
    onClose(false);
  }

  async function handleConfirm() {
    const url = await postToMintGarden(offerData, testnet);
    console.log(`MintGarden URL: ${url}`);
    setSharedURL(url);
  }

  if (sharedURL) {
    return (
      <Dialog
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="xs"
        open={open}
        onClose={handleClose}
        fullWidth
      >
        <DialogTitle>
          <Trans>Offer Shared</Trans>
        </DialogTitle>
        <DialogContent dividers>
          <Flex flexDirection="column" gap={3} sx={{ paddingTop: '1em' }}>
            <TextField
              label={<Trans>MintGarden URL</Trans>}
              value={sharedURL}
              variant="filled"
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <InputAdornment position="end">
                    <CopyToClipboard value={sharedURL} />
                  </InputAdornment>
                ),
              }}
              fullWidth
            />
            <Flex>
              <Button
                variant="outlined"
                onClick={() => openExternal(sharedURL)}
              >
                <Trans>View on MintGarden</Trans>
              </Button>
            </Flex>
          </Flex>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary" variant="contained">
            <Trans>Close</Trans>
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <OfferShareConfirmationDialog
      offerRecord={offerRecord}
      offerData={offerData}
      testnet={testnet}
      title={<Trans>Share on MintGarden</Trans>}
      onConfirm={handleConfirm}
      open={open}
      onClose={onClose}
    />
  );
}

OfferShareMintGardenDialog.defaultProps = {
  open: false,
  onClose: () => {},
};

function OfferShareOfferBinDialog(props: OfferShareServiceDialogProps) {
  const { offerRecord, offerData, testnet, onClose, open } = props;
  const openExternal = useOpenExternal();
  const [sharePrivately, setSharePrivately] = React.useState(false);
  const [sharedURL, setSharedURL] = React.useState('');

  function handleClose() {
    onClose(false);
  }

  async function handleConfirm() {
    const url = await postToOfferBin(offerData, sharePrivately, testnet);
    console.log(`OfferBin URL (private=${sharePrivately}): ${url}`);
    setSharedURL(url);
  }

  if (sharedURL) {
    return (
      <Dialog
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="xs"
        open={open}
        onClose={handleClose}
        fullWidth
      >
        <DialogTitle>
          <Trans>Offer Shared</Trans>
        </DialogTitle>
        <DialogContent dividers>
          <Flex flexDirection="column" gap={3} sx={{ paddingTop: '1em' }}>
            <TextField
              label={<Trans>OfferBin URL</Trans>}
              value={sharedURL}
              variant="filled"
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <InputAdornment position="end">
                    <CopyToClipboard value={sharedURL} />
                  </InputAdornment>
                ),
              }}
              fullWidth
            />
            <Flex>
              <Button
                variant="outlined"
                onClick={() => openExternal(sharedURL)}
              >
                <Trans>View on OfferBin</Trans>
              </Button>
            </Flex>
          </Flex>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary" variant="contained">
            <Trans>Close</Trans>
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <OfferShareConfirmationDialog
      offerRecord={offerRecord}
      offerData={offerData}
      testnet={testnet}
      title={<Trans>Share on OfferBin</Trans>}
      onConfirm={handleConfirm}
      open={open}
      onClose={onClose}
      actions={
        <FormControlLabel
          control={
            <Checkbox
              name="sharePrivately"
              checked={sharePrivately}
              onChange={(event) => setSharePrivately(event.target.checked)}
            />
          }
          label={
            <>
              <Trans>Share Privately</Trans>{' '}
              <TooltipIcon>
                <Trans>
                  If selected, your offer will be not be shared publicly.
                </Trans>
              </TooltipIcon>
            </>
          }
        />
      }
    />
  );
}

OfferShareOfferBinDialog.defaultProps = {
  open: false,
  onClose: () => {},
};

function OfferShareHashgreenDialog(props: OfferShareServiceDialogProps) {
  const { offerRecord, offerData, testnet, onClose, open } = props;
  const openExternal = useOpenExternal();
  const [sharedURL, setSharedURL] = React.useState('');

  function handleClose() {
    onClose(false);
  }

  async function handleConfirm() {
    const url = await postToHashgreen(offerData, testnet);
    console.log(`Hashgreen URL: ${url}`);
    setSharedURL(url);
  }

  if (sharedURL) {
    return (
      <Dialog
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="xs"
        open={open}
        onClose={handleClose}
        fullWidth
      >
        <DialogTitle>
          <Trans>Offer Shared</Trans>
        </DialogTitle>
        <DialogContent dividers>
          <Flex flexDirection="column" gap={3} sx={{ paddingTop: '1em' }}>
            <TextField
              label={<Trans>Hashgreen DEX URL</Trans>}
              value={sharedURL}
              variant="filled"
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <InputAdornment position="end">
                    <CopyToClipboard value={sharedURL} />
                  </InputAdornment>
                ),
              }}
              fullWidth
            />
            <Flex>
              <Button
                variant="outlined"
                onClick={() => openExternal(sharedURL)}
              >
                <Trans>View on Hashgreen DEX</Trans>
              </Button>
            </Flex>
          </Flex>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary" variant="contained">
            <Trans>Close</Trans>
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <OfferShareConfirmationDialog
      offerRecord={offerRecord}
      offerData={offerData}
      testnet={testnet}
      title={<Trans>Share on Hashgreen DEX</Trans>}
      onConfirm={handleConfirm}
      open={open}
      onClose={onClose}
    />
  );
}

OfferShareHashgreenDialog.defaultProps = {
  open: false,
  onClose: () => {},
};

function OfferShareDiscordDialog(props: OfferShareServiceDialogProps) {
  const { offerRecord, offerData, testnet, onClose, open } = props;
  const { lookupByAssetId } = useAssetIdName();
  const showError = useShowError();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isJoiningTeam, setIsJoiningTeam] = React.useState(false);
  const [shared, setShared] = React.useState(false);
  const teamName = testnet ? 'teststaioffersdev' : DiscordTeamName;
  const channelName = testnet ? 'offers' : DiscordChannelName;

  function handleClose() {
    onClose(false);
  }

  async function handleDiscordInstall() {
    try {
      const shell: Shell = (window as any).shell;
      await shell.openExternal('https://discord.com/download');
    } catch (e) {
      showError(
        new Error(
          t`Unable to open browser. Install Discord from https://discord.com`,
        ),
      );
    }
  }

  async function handleDiscordJoinTeam() {
    setIsJoiningTeam(true);

    try {
      const shell: Shell = (window as any).shell;
      const joinTeamSucceeded = await execDiscordCLI({
        action: DiscordCLIActions.JOIN_TEAM,
        teamName,
        channelName,
      });
      let joinTeamThroughURL = false;
      if (joinTeamSucceeded) {
        let attempts = 0;
        let isMember = false;
        while (attempts < 20) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          isMember = await execDiscordCLI({
            action: DiscordCLIActions.CHECK_TEAM_MEMBERSHIP,
            teamName,
            channelName,
          });

          if (isMember) {
            console.log('Joined team successfully');
            break;
          }

          attempts++;
        }

        if (isMember) {
          attempts = 0;
          let joinChannelSucceeded = false;
          while (attempts < 30) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            joinChannelSucceeded = await execDiscordCLI({
              action: DiscordCLIActions.JOIN_CHANNEL,
              teamName,
              channelName,
            });

            if (joinChannelSucceeded) {
              break;
            }

            attempts++;
          }

          if (joinChannelSucceeded) {
            console.log('Joined channel successfully');
            await new Promise((resolve) => setTimeout(resolve, 1000));
            await shell.openExternal(
              `keybase://chat/${teamName}#${channelName}`,
            );
          } else {
            console.error('Failed to join channel');
            shell.openExternal(`keybase://chat/${teamName}#${channelName}`);
          }
        } else {
          console.error('Failed to join team');
          joinTeamThroughURL = true;
        }
      } else {
        joinTeamThroughURL = true;
      }

      if (joinTeamThroughURL) {
        await shell.openExternal(`keybase://team-page/${teamName}/join`);
      }
    } catch (e) {
      showError(
        new Error(
          t`Discord command failed ${e}. If you haven't installed Discord, you can download from https://discord.com`,
        ),
      );
    } finally {
      setIsJoiningTeam(false);
    }
  }

  async function handleDiscordGoToChannel() {
    try {
      const shell: Shell = (window as any).shell;
      await shell.openExternal(`keybase://chat/${teamName}#${channelName}`);
    } catch (e) {
      showError(
        new Error(
          t`Unable to open Discord. Install Discord from https://discord.com`,
        ),
      );
    }
  }

  async function handleDiscordShare() {
    let success = false;

    try {
      setIsSubmitting(true);
      success = await postToDiscord(
        offerRecord,
        offerData,
        teamName,
        channelName,
        lookupByAssetId,
      );

      if (success) {
        setShared(true);
      }
    } catch (e) {
      showError(e);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (shared) {
    return (
      <Dialog
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="xs"
        open={open}
        onClose={handleClose}
        fullWidth
      >
        <DialogTitle>
          <Trans>Offer Shared</Trans>
        </DialogTitle>
        <DialogContent dividers>
          <Flex flexDirection="column" gap={3} sx={{ paddingTop: '1em' }}>
            <Trans>Your offer has been successfully posted to Discord.</Trans>
          </Flex>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDiscordGoToChannel} variant="outlined">
            <Trans>Go to #{channelName}</Trans>
          </Button>
          <Button onClick={handleClose} color="primary" variant="contained">
            <Trans>Close</Trans>
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      maxWidth="sm"
      open={open}
      fullWidth
    >
      <DialogTitle id="alert-dialog-title">
        <Trans>Share on Discord</Trans>
      </DialogTitle>
      <DialogContent dividers>
        <Flex flexDirection="column" gap={2}>
          <Typography variant="body2">
            <Trans>
              Discord is a messaging and file sharing application. To
              share an offer in the Discord {teamName} team, you must first have
              Discord installed.
            </Trans>
          </Typography>
          <Flex justifyContent="center" flexGrow={0}>
            <Button onClick={handleDiscordInstall} variant="outlined">
              <Trans>Install Discord</Trans>
            </Button>
          </Flex>
          <Divider />
          <Typography variant="body2">
            <Trans>
              Before posting an offer in Discord to the #{channelName} channel,
              you must first join the {teamName} team. Please note that it might
              take a few moments to join the channel.
            </Trans>
          </Typography>
          <Flex justifyContent="center" flexGrow={0}>
            <ButtonLoading
              onClick={handleDiscordJoinTeam}
              variant="outlined"
              loading={isJoiningTeam}
            >
              <Trans>Join {teamName}</Trans>
            </ButtonLoading>
          </Flex>
        </Flex>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleDiscordGoToChannel}
          color="primary"
          variant="contained"
        >
          <Trans>Go to #{channelName}</Trans>
        </Button>
        <Flex flexGrow={1}></Flex>
        <Button
          onClick={handleClose}
          color="primary"
          variant="contained"
          disabled={isSubmitting}
        >
          <Trans>Cancel</Trans>
        </Button>
        <ButtonLoading
          onClick={handleDiscordShare}
          variant="outlined"
          loading={isSubmitting}
        >
          <Trans>Share</Trans>
        </ButtonLoading>
      </DialogActions>
    </Dialog>
  );
}

OfferShareDiscordDialog.defaultProps = {
  open: false,
  onClose: () => {},
};

function OfferShareOfferpoolDialog(props: OfferShareServiceDialogProps) {
  const { offerRecord, offerData, testnet, onClose, open } = props;
  const openExternal = useOpenExternal();
  const [offerResponse, setOfferResponse] =
    React.useState<PostToOfferpoolResponse>();

  function handleClose() {
    onClose(false);
  }

  async function handleConfirm() {
    const result = await postToOfferpool(offerData, testnet);
    console.log(`offerpool result ${JSON.stringify(result)}`);
    setOfferResponse(result);
  }

  if (offerResponse) {
    return (
      <Dialog
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        maxWidth="xs"
        open={open}
        onClose={handleClose}
        fullWidth
      >
        <DialogTitle>
          <Trans>Offer Shared</Trans>
        </DialogTitle>
        <DialogContent dividers>
          <Flex flexDirection="column" gap={3} sx={{ paddingTop: '1em' }}>
            <Trans>
              {offerResponse.success
                ? 'Your offer has been successfully posted to offerpool.'
                : `Error posting offer: ${offerResponse.error_message}`}
            </Trans>
          </Flex>
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            onClick={() => openExternal('https://offerpool.io/')}
          >
            <Trans>Go to Offerpool</Trans>
          </Button>
          <Button onClick={handleClose} color="primary" variant="contained">
            <Trans>Close</Trans>
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <OfferShareConfirmationDialog
      offerRecord={offerRecord}
      offerData={offerData}
      testnet={testnet}
      title={<Trans>Share on offerpool</Trans>}
      onConfirm={handleConfirm}
      open={open}
      onClose={onClose}
    />
  );
}

OfferShareOfferpoolDialog.defaultProps = {
  open: false,
  onClose: () => {},
};

/* ========================================================================== */

type OfferShareConfirmationDialogProps = CommonOfferProps &
  CommonDialogProps & {
    title: React.ReactElement;
    onConfirm: () => Promise<void>;
    actions?: React.ReactElement;
  };

function OfferShareConfirmationDialog(
  props: OfferShareConfirmationDialogProps,
) {
  const {
    offerRecord,
    offerData,
    testnet,
    title,
    onConfirm,
    actions = null,
    onClose,
    open,
  } = props;
  const showError = useShowError();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const isNFTOffer = offerContainsAssetOfType(offerRecord.summary, 'singleton');
  const OfferSummaryComponent = isNFTOffer ? NFTOfferSummary : OfferSummary;

  function handleClose() {
    onClose(false);
  }

  async function handleConfirm() {
    try {
      setIsSubmitting(true);

      await onConfirm();
    } catch (e) {
      showError(e);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      maxWidth="sm"
      open={open}
      fullWidth
    >
      <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
      <DialogContent dividers>
        <Flex flexDirection="column" gap={1} style={{ paddingTop: '1em' }}>
          <OfferSummaryComponent
            isMyOffer={true}
            imported={false}
            summary={offerRecord.summary}
            makerTitle={
              <Typography variant="subtitle1">
                <Trans>Your offer:</Trans>
              </Typography>
            }
            takerTitle={
              <Typography variant="subtitle1">
                <Trans>In exchange for:</Trans>
              </Typography>
            }
            rowIndentation={3}
            showNFTPreview={true}
          />
        </Flex>
      </DialogContent>
      <DialogActions>
        {actions}
        <Flex flexGrow={1}></Flex>
        <Button
          onClick={handleClose}
          color="primary"
          variant="contained"
          disabled={isSubmitting}
        >
          <Trans>Cancel</Trans>
        </Button>
        <ButtonLoading
          onClick={handleConfirm}
          variant="outlined"
          loading={isSubmitting}
        >
          <Trans>Share</Trans>
        </ButtonLoading>
      </DialogActions>
    </Dialog>
  );
}

/* ========================================================================== */

type OfferShareDialogProps = CommonOfferProps &
  CommonDialogProps & {
    showSuppressionCheckbox: boolean;
    exportOffer?: () => void;
  };

interface OfferShareDialogProvider extends OfferSharingProvider {
  dialogComponent: React.FunctionComponent<OfferShareServiceDialogProps>;
  props: {};
}

export default function OfferShareDialog(props: OfferShareDialogProps) {
  const {
    offerRecord,
    offerData,
    showSuppressionCheckbox,
    testnet,
    exportOffer,
    onClose,
    open,
  } = props;
  const openDialog = useOpenDialog();
  const [suppressShareOnCreate, setSuppressShareOnCreate] =
    useLocalStorage<boolean>(OfferLocalStorageKeys.SUPPRESS_SHARE_ON_CREATE);
  const isNFTOffer = offerContainsAssetOfType(offerRecord.summary, 'singleton');

  const shareOptions: OfferShareDialogProvider[] = useMemo(() => {
    const capabilities = isNFTOffer
      ? [OfferSharingCapability.NFT]
      : [OfferSharingCapability.Token];

    const dialogComponents: {
      [key in OfferSharingService]: {
        component: React.FunctionComponent<OfferShareServiceDialogProps>;
        props: any;
      };
    } = {
      [OfferSharingService.Dexie]: {
        component: OfferShareDexieDialog,
        props: {},
      },
      [OfferSharingService.Hashgreen]: {
        component: OfferShareHashgreenDialog,
        props: {},
      },
      ...(testnet
        ? {
            [OfferSharingService.MintGarden]: {
              component: OfferShareMintGardenDialog,
              props: {},
            },
          }
        : {}),
      [OfferSharingService.OfferBin]: {
        component: OfferShareOfferBinDialog,
        props: {},
      },
      [OfferSharingService.Offerpool]: {
        component: OfferShareOfferpoolDialog,
        props: {},
      },
      [OfferSharingService.Discord]: {
        component: OfferShareDiscordDialog,
        props: {},
      },
    };

    const options = Object.keys(OfferSharingService)
      .filter((key) => Object.keys(dialogComponents).includes(key))
      .filter((key) =>
        OfferSharingProviders[key as OfferSharingService].capabilities.some(
          (cap) => capabilities.includes(cap),
        ),
      )
      .map((key) => {
        const { component, props } =
          dialogComponents[key as OfferSharingService];
        return {
          ...OfferSharingProviders[key as OfferSharingService],
          dialogComponent: component,
          dialogProps: props,
        };
      });

    return options;
  }, [isNFTOffer]);

  function handleClose() {
    onClose(false);
  }

  async function handleShare(dialogProvider: OfferShareDialogProvider) {
    const DialogComponent = dialogProvider.dialogComponent;
    const props = dialogProvider.props;

    await openDialog(
      <DialogComponent
        offerRecord={offerRecord}
        offerData={offerData}
        testnet={testnet}
        {...props}
      />,
    );
  }

  function toggleSuppression(value: boolean) {
    setSuppressShareOnCreate(value);
  }

  return (
    <Dialog
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      maxWidth="md"
      open={open}
    >
      <DialogTitle id="alert-dialog-title">
        <Trans>Share Offer</Trans>
      </DialogTitle>

      <DialogContent dividers>
        <Flex flexDirection="column" gap={2}>
          <Flex flexDirection="column" gap={2}>
            <Typography variant="subtitle1">
              Where would you like to share your offer?
            </Typography>
            <Flex flexDirection="column" gap={3}>
              {shareOptions.map((dialogProvider, index) => {
                return (
                  <Button
                    variant="outlined"
                    onClick={() => handleShare(dialogProvider)}
                    key={index}
                  >
                    {dialogProvider.name}
                  </Button>
                );
              })}
              {exportOffer !== undefined && (
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={exportOffer}
                >
                  <Flex flexDirection="column">Save Offer File</Flex>
                </Button>
              )}
            </Flex>
          </Flex>
          {showSuppressionCheckbox && (
            <FormControlLabel
              control={
                <Checkbox
                  name="suppressShareOnCreate"
                  checked={!!suppressShareOnCreate}
                  onChange={(event) => toggleSuppression(event.target.checked)}
                />
              }
              label={<Trans>Do not show this dialog again</Trans>}
            />
          )}
        </Flex>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary" variant="contained">
          <Trans>Close</Trans>
        </Button>
      </DialogActions>
    </Dialog>
  );
}

OfferShareDialog.defaultProps = {
  open: false,
  onClose: () => {},
  showSuppressionCheckbox: false,
  testnet: false,
};
