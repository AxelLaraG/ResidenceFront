import React from 'react';
import styled from 'styled-components';

const CheckBox = ({checked, onChange, id}) => {
  // Generar un ID único si no se proporciona uno
  const uniqueId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <StyledWrapper>
      <div className="checkbox-wrapper-19">
        <input id={uniqueId} type="checkbox" checked={checked} onChange={onChange}/>
        <label className="check-box" htmlFor={uniqueId}>
        </label></div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .checkbox-wrapper-19 {
    box-sizing: border-box;
    --background-color: #fff;
    --checkbox-height: 25px;
  }

  @-moz-keyframes dothabottomcheck-19 {
    0% {
      height: 0;
    }

    100% {
      height: calc(var(--checkbox-height) / 2);
    }
  }

  @-webkit-keyframes dothabottomcheck-19 {
    0% {
      height: 0;
    }

    100% {
      height: calc(var(--checkbox-height) / 2);
    }
  }

  @keyframes dothabottomcheck-19 {
    0% {
      height: 0;
    }

    100% {
      height: calc(var(--checkbox-height) / 2);
    }
  }

  @keyframes dothatopcheck-19 {
    0% {
      height: 0;
    }

    50% {
      height: 0;
    }

    100% {
      height: calc(var(--checkbox-height) * 1.2);
    }
  }

  @-webkit-keyframes dothatopcheck-19 {
    0% {
      height: 0;
    }

    50% {
      height: 0;
    }

    100% {
      height: calc(var(--checkbox-height) * 1.2);
    }
  }

  @-moz-keyframes dothatopcheck-19 {
    0% {
      height: 0;
    }

    50% {
      height: 0;
    }

    100% {
      height: calc(var(--checkbox-height) * 1.2);
    }
  }

  .checkbox-wrapper-19 input[type=checkbox] {
    display: none;
  }

  .checkbox-wrapper-19 .check-box {
    height: var(--checkbox-height);
    width: var(--checkbox-height);
    background-color: transparent;
    border: calc(var(--checkbox-height) * .1) solid #000;
    border-radius: 5px;
    position: relative;
    display: inline-block;
    -moz-box-sizing: border-box;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    -moz-transition: border-color ease 0.2s;
    -o-transition: border-color ease 0.2s;
    -webkit-transition: border-color ease 0.2s;
    transition: border-color ease 0.2s;
    cursor: pointer;
  }

  .checkbox-wrapper-19 .check-box::before,
    .checkbox-wrapper-19 .check-box::after {
    -moz-box-sizing: border-box;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    position: absolute;
    height: 0;
    width: calc(var(--checkbox-height) * .2);
    background-color: #34b93d;
    display: inline-block;
    -moz-transform-origin: left top;
    -ms-transform-origin: left top;
    -o-transform-origin: left top;
    -webkit-transform-origin: left top;
    transform-origin: left top;
    border-radius: 5px;
    content: " ";
    -webkit-transition: opacity ease 0.5;
    -moz-transition: opacity ease 0.5;
    transition: opacity ease 0.5;
  }

  .checkbox-wrapper-19 .check-box::before {
    top: calc(var(--checkbox-height) * .72);
    left: calc(var(--checkbox-height) * .41);
    box-shadow: 0 0 0 calc(var(--checkbox-height) * .05) var(--background-color);
    -moz-transform: rotate(-135deg);
    -ms-transform: rotate(-135deg);
    -o-transform: rotate(-135deg);
    -webkit-transform: rotate(-135deg);
    transform: rotate(-135deg);
  }

  .checkbox-wrapper-19 .check-box::after {
    top: calc(var(--checkbox-height) * .37);
    left: calc(var(--checkbox-height) * .05);
    -moz-transform: rotate(-45deg);
    -ms-transform: rotate(-45deg);
    -o-transform: rotate(-45deg);
    -webkit-transform: rotate(-45deg);
    transform: rotate(-45deg);
  }

  .checkbox-wrapper-19 input[type=checkbox]:checked + .check-box,
    .checkbox-wrapper-19 .check-box.checked {
    border-color: #34b93d;
  }

  .checkbox-wrapper-19 input[type=checkbox]:checked + .check-box::after,
    .checkbox-wrapper-19 .check-box.checked::after {
    height: calc(var(--checkbox-height) / 2);
    -moz-animation: dothabottomcheck-19 0.2s ease 0s forwards;
    -o-animation: dothabottomcheck-19 0.2s ease 0s forwards;
    -webkit-animation: dothabottomcheck-19 0.2s ease 0s forwards;
    animation: dothabottomcheck-19 0.2s ease 0s forwards;
  }

  .checkbox-wrapper-19 input[type=checkbox]:checked + .check-box::before,
    .checkbox-wrapper-19 .check-box.checked::before {
    height: calc(var(--checkbox-height) * 1.2);
    -moz-animation: dothatopcheck-19 0.4s ease 0s forwards;
    -o-animation: dothatopcheck-19 0.4s ease 0s forwards;
    -webkit-animation: dothatopcheck-19 0.4s ease 0s forwards;
    animation: dothatopcheck-19 0.4s ease 0s forwards;
  }`;

export default CheckBox;
