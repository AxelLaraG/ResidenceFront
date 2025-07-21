import React from 'react';
import styled from 'styled-components';

const CountDown = () => {
  return (
    <StyledWrapper>
      <div className="black-friday-component">
        <div className="timer">
          <div className="item">
            <div className="minutes">
              <div className="min">
                <span>00</span><span>01</span><span>02</span><span>03</span><span>04</span><span>05</span><span>06</span><span>07</span><span>08</span><span>09</span><span>10</span><span>11</span><span>12</span><span>13</span><span>14</span><span>15</span><span>16</span><span>17</span><span>18</span><span>19</span><span>20</span><span>21</span><span>22</span><span>23</span><span>24</span><span>25</span><span>26</span><span>27</span><span>28</span><span>29</span><span>30</span><span>31</span><span>32</span><span>33</span><span>34</span><span>35</span><span>36</span><span>37</span><span>38</span><span>39</span><span>40</span><span>41</span><span>42</span><span>43</span><span>44</span><span>45</span><span>46</span><span>47</span><span>48</span><span>49</span><span>50</span><span>51</span><span>52</span><span>53</span><span>54</span><span>55</span><span>56</span><span>57</span><span>58</span><span>59</span><span>60</span>
              </div>
            </div>
            <p>min</p>
          </div>
          <span className="colon">:</span>
          <div className="item">
            <div className="seconds">
              <div className="sec">
                <span>00</span><span>01</span><span>02</span><span>03</span><span>04</span><span>05</span><span>06</span><span>07</span><span>08</span><span>09</span><span>10</span><span>11</span><span>12</span><span>13</span><span>14</span><span>15</span><span>16</span><span>17</span><span>18</span><span>19</span><span>20</span><span>21</span><span>22</span><span>23</span><span>24</span><span>25</span><span>26</span><span>27</span><span>28</span><span>29</span><span>30</span><span>31</span><span>32</span><span>33</span><span>34</span><span>35</span><span>36</span><span>37</span><span>38</span><span>39</span><span>40</span><span>41</span><span>42</span><span>43</span><span>44</span><span>45</span><span>46</span><span>47</span><span>48</span><span>49</span><span>50</span><span>51</span><span>52</span><span>53</span><span>54</span><span>55</span><span>56</span><span>57</span><span>58</span><span>59</span><span>60</span>
              </div>
            </div>
            <p>sec</p>
          </div>
        </div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  /*the style has written with Scss and*/
  /* files on my GitHub👾 check the pio*/

  .black-friday-component {
    --count: 0;
    --days: 31;
    --hours: 24;
    --minutes: 05;
    --seconds: 00;
    flex-direction: column;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    width: -moz-fit-content;
    width: fit-content;
    margin: auto;
    padding: 0 40px;
  }
  .black-friday-component .coupon {
    border-radius: 12px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    border: 1px solid #654bff;
    scale: 0.7;
    transform-origin: bottom center;
  }
  .black-friday-component .coupon:hover .content h3 > span {
    animation: jump 0.15s ease-out 1 normal both;
  }
  .black-friday-component .coupon:hover .content h3 > span:nth-of-type(1) {
    animation-delay: 0.03s;
  }
  .black-friday-component .coupon:hover .content h3 > span:nth-of-type(2) {
    animation-delay: 0.06s;
  }
  .black-friday-component .coupon:hover .content h3 > span:nth-of-type(3) {
    animation-delay: 0.09s;
  }
  .black-friday-component .coupon:hover .content h3 > span:nth-of-type(4) {
    animation-delay: 0.12s;
  }
  .black-friday-component .coupon:hover .content h3 > span:nth-of-type(5) {
    animation-delay: 0.15s;
  }
  .black-friday-component .coupon:hover .content h3 > span:nth-of-type(6) {
    animation-delay: 0.18s;
  }
  .black-friday-component .coupon:hover .content h3 > span:nth-of-type(7) {
    animation-delay: 0.21s;
  }
  .black-friday-component .coupon:hover .content h3 > span:nth-of-type(8) {
    animation-delay: 0.24s;
  }
  .black-friday-component .coupon:hover .content h3 > span:nth-of-type(9) {
    animation-delay: 0.27s;
  }
  .black-friday-component .coupon:hover .content h3 > span:nth-of-type(10) {
    animation-delay: 0.3s;
  }
  .black-friday-component .coupon:hover .content h3 > span:nth-of-type(11) {
    animation-delay: 0.33s;
  }
  .black-friday-component .coupon:hover .content h3 > span:nth-of-type(12) {
    animation-delay: 0.36s;
  }
  .black-friday-component .coupon .box {
    height: 100%;
    width: 130px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    color: #fff;
    padding: 1rem;
  }
  .black-friday-component .coupon .box span {
    display: block;
    font-weight: bold;
    font-size: 1.8rem;
  }
  .black-friday-component .coupon .diver {
    display: block;
    width: 0px;
    height: 160px;
    border: 3px dashed transparent;
    border-right-color: #654bff;
  }
  .black-friday-component .coupon .content {
    padding: 1rem;
    flex: 1;
    color: #fff;
    width: 330px;
    height: 100%;
  }
  .black-friday-component .coupon .content h3 {
    font-weight: 600;
    font-size: 2rem;
    height: 34px;
    align-items: center;
    display: flex;
    justify-content: flex-start;
    margin-bottom: 1rem;
  }
  .black-friday-component .coupon .content h3 span.end {
    width: 30px;
  }
  .black-friday-component .coupon .content p {
    font-weight: 400;
    font-style: normal;
    color: #959595;
    font-size: 1rem;
    line-height: 1.25rem;
  }
  .black-friday-component .coupon .content p a {
    font-style: italic;
    color: #654bff;
    text-transform: capitalize;
    word-spacing: 0.03rem;
    font-weight: bolder;
    text-decoration: underline;
    text-underline-offset: 0.05rem;
    text-decoration-color: #654bff;
  }
  .black-friday-component .timer {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    gap: 0rem;
    overflow: hidden;
    width: calc(244px + 0rem);
    text-align: center;
  }
  .black-friday-component .timer .colon {
    width: 8px;
    color: #fff;
    font-size: 2rem;
  }
  .black-friday-component .timer .item {
    text-align: center;
    width: 55px;
    height: fit-content;
  }
  .black-friday-component .timer .item .days,
  .black-friday-component .timer .item .hours,
  .black-friday-component .timer .item .minutes,
  .black-friday-component .timer .item .seconds {
    text-align: center;
    width: 55px;
    overflow: hidden;
    height: 40px;
  }
  .black-friday-component .timer .item .day,
  .black-friday-component .timer .item .hour,
  .black-friday-component .timer .item .min,
  .black-friday-component .timer .item .sec {
    text-align: center;
    height: fit-content;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
  }
  .black-friday-component .timer .item .day span,
  .black-friday-component .timer .item .hour span,
  .black-friday-component .timer .item .min span,
  .black-friday-component .timer .item .sec span {
    height: 40px;
    color: #fff;
    font-size: 2rem;
    display: inline-block;
  }
  .black-friday-component .timer .item .day {
    --count: var(--days);
    animation: slide calc(var(--count) * 86400s) ease-out 0s 31 normal both;
  }
  .black-friday-component .timer .item .hour {
    --count: var(--hours);
    animation: slide calc(var(--count) * 3600s) steps(var(--count)) 0s 24 normal
      both;
  }
  .black-friday-component .timer .item .min {
    --count: var(--minutes);
    animation: slide calc(var(--count) * 60s) steps(var(--count)) 0s 60 normal
      both;
  }
  .black-friday-component .timer .item .sec {
    --count: var(--seconds);
    animation: slide calc(var(--count) * 1s) steps(var(--count)) 0s 60 normal both;
  }
  .black-friday-component .timer .item p {
    text-align: center;
    color: #fff;
    font-size: 1.2rem;
    font-weight: 400;
  }

  @keyframes slide {
    0% {
      transform: translateY(calc(-40px * var(--count)));
    }
    99.6% {
      transform: translateY(0);
    }
    100% {
      transform: translateY(calc(-40px * var(--count)));
    }
  }
  @keyframes jump {
    0% {
      transform: translateY(0);
      scale: 1;
    }
    50% {
      transform: translateY(-10px);
      scale: 1.1;
    }
    100% {
      transform: translateY(0);
      scale: 1;
    }
  }`;

export default CountDown;
