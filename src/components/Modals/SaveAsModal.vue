<!-- OpenStudio(R), Copyright (c) 2008-2016, Alliance for Sustainable Energy, LLC. All rights reserved.
Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
(1) Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
(2) Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
(3) Neither the name of the copyright holder nor the names of any contributors may be used to endorse or promote products derived from this software without specific prior written permission from the respective party.
(4) Other than as required in clauses (1) and (2), distributions in any form of modifications or other derivative works may not use the "OpenStudio" trademark, "OS", "os", or any other confusingly similar designation without specific prior written permission from Alliance for Sustainable Energy, LLC.
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER, THE UNITED STATES GOVERNMENT, OR ANY CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE. -->

<template>
<aside>
    <div @click="close" class="overlay"></div>
    <div class="modal">
      <span class="close-button" @click="close">x</span>
        <header>
            <h2>Save {{ saveWhat }} as</h2>
        </header>

        <div class="content">
            <span class="input-text">
              <input ref="downloadName" type="text"
                @keyup.enter="downloadFile"
                :value="saveWhat.toLowerCase()"
                spellcheck="false"
              />
              <button class="download-button" @click="downloadFile">download</button>
            </span>
        </div>
    </div>
</aside>
</template>

<script>

export default {
  name: 'save-as-modal',
  props: ['saveWhat', 'dataToDownload', 'onClose'],
  mounted() {
    this.$refs.downloadName.focus();
  },
  methods: {
    downloadFile: function() {
      const a = document.createElement('a');
      a.setAttribute('href', `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(this.dataToDownload))}`);
      a.setAttribute('download', this.$refs.downloadName.value + '.json');
      a.click();

      console.log(`exporting:\n${JSON.stringify(this.dataToDownload)}`); // eslint-disable-line
      this.close();
    },
    close: function() {
      this.onClose();
    },
  },
};
</script>

<style lang="scss" scoped>
@import "./../../scss/config";
.content {
    margin: 1rem;
    text-align: center;

    button {
        margin: 1rem .5rem;
    }


}

.modal {
    width: 30rem;
    position: fixed;
    top: 50%;
    left: 50%;
    z-index: 4;
    cursor: default;

    .close-button, .download-button {
      cursor: pointer;
    }

    .close-button {
      position: relative;
      float: left;
      left: 18px;
      top: 8px;
    }
}


</style>
