// Floorspace.js, Copyright (c) 2016-2017, Alliance for Sustainable Energy, LLC. All rights reserved.
// Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:
// (1) Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
// (2) Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
// (3) Neither the name of the copyright holder nor the names of any contributors may be used to endorse or promote products derived from this software without specific prior written permission from the respective party.
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER, THE UNITED STATES GOVERNMENT, OR ANY CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
import _ from "lodash";

export function debounce(func, wait) {
  var timeout;

  return function (...args) {
    clearTimeout(timeout);

    timeout = setTimeout(() => {
      timeout = null;
      func.apply(this, args);
    }, wait);
  };
}

export function uniq(arr, key = JSON.stringify) {
  const alreadySeen = {};
  return arr.filter((elem) => {
    const theKey = key(elem);
    if (alreadySeen[theKey]) {
      return false;
    } else {
      alreadySeen[theKey] = true;
      return true;
    }
  });
}

export function allPairs(elems) {
  return _.flatten(
    elems.map((p, ix) => elems.slice(ix + 1).map((p2) => [p, p2]))
  );
}

export function dropConsecutiveDups(arr, key = JSON.stringify) {
  return arr.filter(
    (item, pos) => pos === 0 || key(item) !== key(arr[pos - 1])
  );
}

// get all siblings for a node
export function getSiblings(el) {
  const siblings = [];
  for (
    let sibling = el.parentNode.firstChild;
    sibling;
    sibling = sibling.nextSibling
  ) {
    if (sibling.nodeType === 1 && sibling !== el) {
      siblings.push(sibling);
    }
  }
  return siblings;
}
