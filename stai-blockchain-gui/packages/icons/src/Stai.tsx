import React from 'react';
import { SvgIcon, SvgIconProps } from '@material-ui/core';
import StaiIcon from './images/stai.svg';

export default function Keys(props: SvgIconProps) {
  return <SvgIcon component={StaiIcon} viewBox="0 0 170 58" {...props} />;
}
