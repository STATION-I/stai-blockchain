import React from 'react';
import styled from 'styled-components';
import { Box, BoxProps } from '@material-ui/core';
import { staicoin } from '@staicoin/icons';

const Styledstaicoin = styled(staicoin)`
  max-width: 100%;
  width: auto;
  height: auto;
`;

export default function Logo(props: BoxProps) {
  return (
    <Box {...props}>
      <Styledstaicoin />
    </Box>
  );
}
