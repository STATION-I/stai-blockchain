import React from 'react';
import { SvgIcon, SvgIconProps } from '@mui/material';
import StaiIcon from './images/stai.svg';
import StaiIconDarkTheme from './images/staidarktheme.svg';
import { useDarkMode } from '@stai/core';

export default function Keys(props: SvgIconProps) {
  const { isDarkMode } = useDarkMode();
  return <SvgIcon component={isDarkMode ? StaiIconDarkTheme : StaiIcon} viewBox="0 0 396 191" {...props} />;
}
