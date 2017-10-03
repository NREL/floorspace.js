<!-- OpenStudio(R), Copyright (c) 2008-2016, Alliance for Sustainable Energy, LLC. All rights reserved.
Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
(1) Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
(2) Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
(3) Neither the name of the copyright holder nor the names of any contributors may be used to endorse or promote products derived from this software without specific prior written permission from the respective party.
(4) Other than as required in clauses (1) and (2), distributions in any form of modifications or other derivative works may not use the 'OpenStudio' trademark, 'OS', 'os', or any other confusingly similar designation without specific prior written permission from Alliance for Sustainable Energy, LLC.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS 'AS IS' AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER, THE UNITED STATES GOVERNMENT, OR ANY CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. -->
<template>
  <div class="library-select">
    <div
      v-for="item in rows"
      :key="item.id"
      :class="{ active: selectedItemId === item.id }"
      @click="selectItem(item)"
      :data-id="item.id"
    >
        <span :style="{ 'background-color': item.color }"></span>
        {{item.name}}
        <svg @click="destroyItem(item)" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
            <path d="M137.05 128l75.476-75.475c2.5-2.5 2.5-6.55 0-9.05s-6.55-2.5-9.05 0L128 118.948 52.525 43.474c-2.5-2.5-6.55-2.5-9.05 0s-2.5 6.55 0 9.05L118.948 128l-75.476 75.475c-2.5 2.5-2.5 6.55 0 9.05 1.25 1.25 2.888 1.876 4.525 1.876s3.274-.624 4.524-1.874L128 137.05l75.475 75.476c1.25 1.25 2.888 1.875 4.525 1.875s3.275-.624 4.525-1.874c2.5-2.5 2.5-6.55 0-9.05L137.05 128z"/>
        </svg>
    </div>
  </div>
</template>

<script>

export default {
  name: 'LibrarySelect',
  props: ['rows', 'selectedItemId', 'selectItem', 'destroyItem'],
}
</script>

<style lang="scss" scoped>
@import "./../scss/config";

.library-select {
  padding: 0 0 !important;
  display: flex;
  flex-flow: column;
  justify-content: flex-start;
  height: calc(100% - 5rem);

  > div {
    border-bottom: 1px solid $gray-darkest;
    cursor: pointer;
    width: calc(100% - 1rem);;
    height: 2rem;
    padding: 0 .5rem;

    align-items: center;
    display: flex;
    justify-content: space-between;

    &.active {
      color: $primary;
      background: $gray-medium-light;
    }
    span {
      display: inline-block;
      height: 1rem;
      width: 1rem;
    }

    svg {
      height: 1rem;
      fill: $gray-lightest;

      &:hover {
        fill: $secondary;
      }
    }

  }
  // overflow: auto;
  // height: calc(100% - 5rem);
  // > div  {
  //     border-bottom: 1px solid $gray-darkest;
  //     cursor: pointer;
  //     height: 2rem;
  //     padding: 0 .5rem;
  //     span {
  //         display: inline-block;
  //         height: 1rem;
  //         width: 1rem;
  //     }
  //     &.active {
  //         color: $primary;
  //         svg {
  //             cursor: pointer;
  //             height: 1rem;
  //             path {
  //                 fill: $gray-lightest;
  //             }
  //             &:hover {
  //                 path {
  //                     fill: $secondary;
  //                 }
  //             }
  //         }
  //     }
  // }
}

</style>
