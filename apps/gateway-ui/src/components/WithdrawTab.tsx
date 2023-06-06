import React, { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Flex,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  TabPanel,
  Text,
  useToast,
  VStack,
} from '@chakra-ui/react';
import { TabHeader, Button, Input, ApiContext } from '.';
import { TransactionStatus } from '../api';
import { useTranslation } from '@fedimint/utils';

export const WithdrawTabHeader = () => {
  const { t } = useTranslation();
  return <TabHeader>{t('withdraw_tab.tab_header')}</TabHeader>;
};

interface WithdrawObject {
  amount: number;
  address: string;
}

export interface WithdrawTabProps {
  federationId: string;
}

const truncateStringFormat = (arg: string): string => {
  return `${arg.substring(0, 15)}......${arg.substring(
    arg.length,
    arg.length - 15
  )}`;
};

export const WithdrawTab = React.memo(function WithdrawTab({
  federationId,
}: WithdrawTabProps): JSX.Element {
  const { t } = useTranslation();
  const { mintgate } = React.useContext(ApiContext);
  const [withdrawObject, setWithdrawObject] = useState<WithdrawObject>({
    amount: 0,
    address: '',
  });
  const [error, setError] = useState<string>('');
  const [modalState, setModalState] = useState<boolean>(false);
  const [transactionList, setTransactionList] = useState<
    Array<TransactionViewProps>
  >([]);
  const { amount, address } = withdrawObject;

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      event.preventDefault();
      const { value, name } = event.target;

      setWithdrawObject((prevState) => ({ ...prevState, [name]: value }));
    },
    [withdrawObject]
  );

  const createWithdrawal = () => {
    if (!amount && amount === 0 && typeof amount === 'number') {
      setError(`${t('withdraw_tab.error_amount')}`);
      return;
    }
    if (!address) {
      setError(`${t('withdraw_tab.error_address')}`);
      return;
    }
    // TODO: address validation
    setError('');
    setModalState(true);
  };

  const startWithdrawal = async () => {
    try {
      const txId = await mintgate.requestWithdrawal(
        federationId,
        amount,
        address
      );

      setTransactionList([
        {
          address,
          amount,
          confirmationsRequired: 3,
          federationId,
          txId,
        },
        ...transactionList,
      ]);
      setWithdrawObject({ ...withdrawObject, amount: 0, address: '' });
      setModalState(false);
    } catch (err) {
      console.log(err);
      setError(`${t('withdraw_tab.error_request')}`);
    }
  };

  return (
    <TabPanel ml='1px' mr='1px' p={{ base: '4px', md: '16px', lg: '16px' }}>
      <Stack spacing='4' maxWidth={{ base: '100%', md: 'md', lg: 'md' }}>
        <Input
          labelName={t('withdraw_tab.amount_label')}
          placeHolder={t('withdraw_tab.amount_placeholder')}
          value={withdrawObject.amount}
          onChange={(e) => handleInputChange(e)}
          name='amount'
        />
        <Input
          labelName={t('withdraw_tab.address_label')}
          placeHolder={t('withdraw_tab.address_placeholder')}
          value={withdrawObject.address}
          onChange={(e) => handleInputChange(e)}
          name='address'
        />

        {error && (
          <Box>
            <Text textAlign='center' color='red' fontSize='14'>
              {t('withdraw_tab.error')}: {error}
            </Text>
          </Box>
        )}

        <Button borderRadius='4' onClick={createWithdrawal}>
          {t('withdraw_tab.withdraw')}
        </Button>
      </Stack>

      <Stack pt='8'>
        {
          <>
            {transactionList.length !== 0 && (
              <>
                <Text color='#2d2d2d' fontSize='18px' fontWeight='600'>
                  {t('withdraw_tab.withdrawal_history')}
                </Text>
                <Box>
                  {transactionList?.map((transaction) => {
                    return (
                      <TransactionView
                        key={transaction.txId}
                        {...transaction}
                      />
                    );
                  })}
                </Box>
              </>
            )}
          </>
        }
      </Stack>
      {modalState && (
        <ConfirmWithdrawModal
          open={modalState}
          txRequest={{ amount, address }}
          onModalClickCallback={() => {
            setModalState(false);
          }}
          onCloseClickCallback={() => {
            setModalState(false);
          }}
          startWithdrawalCallback={startWithdrawal}
        />
      )}
    </TabPanel>
  );
});

export interface ConfirmWithdrawModalProps {
  open: boolean;
  txRequest: {
    amount: number;
    address: string;
  };
  onModalClickCallback: () => void;
  onCloseClickCallback: () => void;
  startWithdrawalCallback: () => void;
}

const ConfirmWithdrawModal = (
  props: ConfirmWithdrawModalProps
): JSX.Element => {
  const { t } = useTranslation();
  const { open, txRequest, onModalClickCallback, startWithdrawalCallback } =
    props;
  const toast = useToast();

  return (
    <div>
      <>
        <Modal onClose={onModalClickCallback} isOpen={open} isCentered>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>{t('withdraw_tab.confirm_withdraw')}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack alignItems='flex-start' justifyContent='space-between'>
                <Box>
                  <Text>{t('common.amount')}:</Text>
                  <Text>
                    {txRequest.amount} {t('common.sats')}
                  </Text>
                </Box>
                <Text>{t('withdraw_tab.to')}</Text>
                <Box>
                  <Text>{t('common.address')}:</Text>
                  <Text>{truncateStringFormat(txRequest.address)}</Text>
                </Box>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button
                onClick={() => {
                  if (startWithdrawalCallback) {
                    startWithdrawalCallback();
                    toast({
                      title: `${t('withdraw_tab.withdrawal_created')}`,
                      description: `${t(
                        'withdraw_tab.withdrawal_created_description'
                      )}`,
                      status: 'success',
                      duration: 5000,
                      isClosable: true,
                      position: 'top-right',
                    });
                  }
                }}
                fontSize={{ base: '12px', md: '13px', lg: '16px' }}
                p={{ base: '10px', md: '13px', lg: '16px' }}
              >
                {t('common.confirm')}
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
    </div>
  );
};

export interface TransactionViewProps {
  amount: number;
  address: string;
  txId: string;
  confirmationsRequired: number;
  federationId?: string;
}

const TransactionView = (props: TransactionViewProps): JSX.Element => {
  const { t } = useTranslation();
  const { explorer } = React.useContext(ApiContext);
  const { confirmationsRequired, amount, address, txId, federationId } = props;

  const [txStatus, setTxStatus] = useState<TransactionStatus | null>(null);
  const [showDetails, setShowDetails] = useState<boolean>(false);

  // track transactions
  useEffect(() => {
    const watchWithdrawal = async (timer?: NodeJS.Timer) => {
      try {
        const currStatus = await explorer.watchTransactionStatus(address, txId);

        if (currStatus.confirmations === confirmationsRequired) {
          timer && clearInterval(timer);
        }
        setTxStatus(currStatus);
      } catch (e) {
        console.log(e);
      }
    };

    const timer = setInterval(async () => {
      await watchWithdrawal(timer);
    }, 5000);

    return () => clearInterval(timer);
  }, [explorer, address, txId]);

  return (
    <Box
      borderRadius='8'
      maxWidth={{ base: '100%', md: 'md', lg: 'md' }}
      p={{ base: '2', md: '4', lg: '4' }}
      boxShadow='rgba(255, 255, 255, 0.2) 0px 0px 0px 1px inset, rgba(0, 0, 0, 0.9) 0px 0px 0px 1px'
      mb='4'
      cursor='pointer'
      onClick={() => txStatus && setShowDetails(!showDetails)}
    >
      <>
        {!showDetails && (
          <>
            <HStack justifyContent='space-between'>
              <Text fontWeight='600'>
                {t('withdraw_tab.requested_withdrawal')}
              </Text>
              <Text fontWeight='600'>
                {amount} {t('common.sats')}
              </Text>
            </HStack>
            <HStack mt='2' alignItems='baseline' justifyContent='space-between'>
              <Text fontSize='15px'>{new Date().toDateString()}</Text>
              <Text
                color={
                  !txStatus
                    ? 'red'
                    : txStatus.status === 'confirmed'
                    ? 'green'
                    : 'orange'
                }
                fontWeight='600'
              >
                {txStatus?.status || 'waiting'}
              </Text>
            </HStack>
          </>
        )}
      </>

      {showDetails && txStatus && (
        <>
          <Box textAlign='center'>
            <Text mt='8' mb='8' fontWeight='600'>
              {t('withdraw_tab.request_from')} {federationId}
            </Text>
            <TransactionDetail
              title='Amount'
              detail={`${amount} ${t('common.sats')}`}
            />
            <TransactionDetail
              title='Address'
              detail={truncateStringFormat(address)}
            />
            <TransactionDetail
              title='Transaction ID'
              detail={truncateStringFormat(txStatus?.transactionId ?? txId)}
            />
            <TransactionDetail
              title='Confirmations'
              detail={`${txStatus?.confirmations ?? 0} |`}
            >
              <Text
                fontWeight='600'
                color={txStatus?.status ? 'green' : 'orange'}
              >
                {txStatus?.status === 'confirmed' ? ' confirmed' : ' pending'}
              </Text>
            </TransactionDetail>
            <TransactionDetail
              title='Date | time'
              detail={`${new Date().toDateString()} | ${new Date().toLocaleTimeString()}`}
            />
            <HStack width='100%' mt='8' spacing='4'>
              <Button
                onClick={() => {
                  window.open(txStatus?.viewTransactionUrl);
                }}
                width={{ base: '100%' }}
              >
                {t('withdraw_tab.view')}
              </Button>
              <Button
                onClick={() => {
                  setShowDetails(false);
                }}
                width={{ base: '100%' }}
              >
                {t('withdraw_tab.close')}
              </Button>
            </HStack>
          </Box>
        </>
      )}
    </Box>
  );
};

export interface TransactionInfoProps {
  title: string;
  detail?: string | number;
  children?: React.ReactNode;
  onClick?: () => void;
  color?: string;
}

const TransactionDetail = (props: TransactionInfoProps): JSX.Element => {
  const { title, detail, children, onClick, color } = props;
  return (
    <HStack
      borderBottom='1px solid #2d2d2d'
      pt='3'
      pb='3'
      alignItems='baseline'
      justifyContent='space-between'
    >
      <Text opacity={0.87} fontSize='15px' color='#2d2d2d'>
        {title}
      </Text>
      <Flex gap='4px' alignItems='center'>
        <Text onClick={onClick} fontWeight='500' color={color} fontSize='15px'>
          {detail}
        </Text>
        {children}
      </Flex>
    </HStack>
  );
};
