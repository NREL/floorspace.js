<!-- Floorspace.js, Copyright (c) 2016-2017, Alliance for Sustainable Energy, LLC. All rights reserved.
Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
(1) Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
(2) Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
(3) Neither the name of the copyright holder nor the names of any contributors may be used to endorse or promote products derived from this software without specific prior written permission from the respective party.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS 'AS IS' AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER, THE UNITED STATES GOVERNMENT, OR ANY CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. -->
<template>
  <div class="library-select">
    <div class="rows">
      <div
        v-for="item in rows"
        :key="item.id"
        :class="{ active: selectedItemId === item.id }"
        @click="selectItem(item)"
        :data-id="item.id"
      >
          <span :style="{ 'background-color': item.color }"></span>
          {{item.name}}
          <a @click.stop="destroyItem(item)" class="destroy" title="delete">
            <Delete class="button" />
          </a>
      </div>
    </div>
  </div>
</template>

<script>
import Delete from './../assets/svg-icons/delete.svg';

export default {
  name: 'LibrarySelect',
  props: ['rows', 'selectedItemId', 'selectItem', 'destroyItem'],
  components: {
    Delete,
  },
}
</script>

<style lang="scss" scoped>
@import "./../scss/config";

.library-select {
  padding: 0 0 !important;
  max-height: calc(100% - 65px);
  overflow-y: auto;
  .rows {
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
        color: #02cf02;
        background: $gray-medium-light;
      }
      span {
        display: inline-block;
        height: 1rem;
        width: 1rem;
      }

      svg {
        height: 1rem;
        width: 1rem;
        margin-top: -5px;
        margin-left: 10px;
        fill: $gray-lightest;

        &:hover {
          fill: $secondary;
        }
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
