import { ThemeConfiguration, Color } from '../theme';

export const light: ThemeConfiguration = {
  header: {
    background: Color.white,
    userButton: {
      background: Color.transparent,
      color: Color['neutral-550']
    },
    profileMenuList: {
      background: Color['neutral-800'],
      color: Color.white,
      svg: {
        color: Color['orange-400']
      },
      menuItem: {
        borderTop: Color['neutral-500']
      },
      menuItemSelected: {
        background: Color.transparent
      }
    },
    mainNavList: {
      background: Color.transparent,
      color: Color['neutral-550'],
      hoverColor: Color['orange-400'],
      popOver: {
        background: Color['neutral-800'],
        primaryNav: {
          color: Color.white,
          link: {
            color: Color.white,
            svg: {
              color: Color['orange-400']
            }
          }
        },
        secondaryNav: {
          background: Color['neutral-700'],
          borderTop: Color['neutral-500'],
          link: {
            color: Color.white,
            svg: {
              color: Color.white
            }
          }
        }
      }
    }
  },
  alert: {
    background: Color.transparent,
    header: {
      badge: {
        background: Color.transparent
      }
    },
    rave: {
      background: Color['lava-400'],
      color: Color.white,
      icon: {
        color: Color.white
      }
    },
    dx: {
      info: {
        background: Color['stratosphere-400'],
        color: Color.white,
        icon: {
          color: Color.white
        }
      },
      warn: {
        background: Color['luminance-300'],
        color: Color.black,
        icon: {
          color: Color.black
        }
      }
    }
  },
  mainGrid: {
    background: Color['neutral-100'],
    borderBottom: Color['neutral-300'],
    borderTop: Color['neutral-200']
  },
  secondGrid: {
    background: Color['neutral-200']
  },
  footer: {
    background: Color.black,
    color: Color.white,
    link: {
      color: Color.white
    },
    iconLink: {
      border: Color['neutral-400'],
      color: Color.white,
      icon: {
        color: Color['orange-400']
      }
    },
    adminText: {
      color: Color['neutral-500']
    },
    masquerade: {
      background: Color.transparent,
      color: Color.white
    }
  },
  ui: {
    button: {
      background: Color['orange-400'],
      color: Color.white
    },
    closeButton: {
      background: Color.transparent,
      color: Color.black
    },
    customButton: {
      background: Color.white,
      selectedBackground: Color['neutral-550'],
      border: Color['neutral-300'],
      color: Color.black,
      selectedColor: Color.white
    },
    infoButton: {
      background: Color.transparent,
      icon: {
        color: Color['neutral-600']
      }
    },
    date: {
      color: Color['orange-400']
    },
    divider: {
      border: Color['neutral-200']
    },
    eventCard: {
      color: Color['neutral-600'],
      background: Color.white,
      title: {
        color: Color['neutral-700']
      },
      largeTitle: {
        color: Color.white
      },
      date: {
        background: Color.white,
        firstChild: {
          color: Color['neutral-700']
        },
        lastChild: {
          color: Color['neutral-700']
        }
      },
      image: {
        background: 'linear-gradient(rgba(0, 0, 0, 0.55), rgba(0, 0, 0, 0.55))',
        color: Color.white,
        title: {
          color: Color.white
        }
      },
      button: {
        color: Color.white,
        icon: {
          color: Color.white
        }
      }
    },
    highlights: {
      card: {
        border: Color['neutral-200']
      },
      description: {
        color: Color['neutral-550']
      },
      emphasis: {
        color: Color['orange-400']
      },
      emphasisInline: {
        color: Color['orange-400']
      },
      title: {
        color: Color['neutral-550']
      }
    },
    icon: {
      background: Color.transparent,
      color: Color['neutral-400'],
      counter: {
        background: Color['orange-400'],
        color: Color.white
      }
    },
    input: {
      border: Color['neutral-300'],
      default: {
        color: Color['neutral-700']
      },
      large: {
        color: Color['neutral-700']
      },
      small: {
        color: Color['stratosphere-400']
      }
    },
    label: {
      color: Color['neutral-700']
    },
    link: {
      background: Color.transparent,
      color: Color['orange-400'],
      icon: {
        external: {
          color: Color['orange-400']
        },
        internal: {
          color: Color['orange-400']
        }
      }
    },
    list: {
      color: Color['neutral-700'],
      item: {
        background: Color.transparent,
        header: {
          color: Color['neutral-700']
        },
        leadText: {
          color: Color['orange-400']
        },
        description: {
          color: Color['neutral-550']
        },
        link: {
          color: Color['orange-400'],
          boxShadow: 'rgba(66, 62, 60, 0.1) 0px 10px 16px, rgba(105, 99, 97, 0.05) 0px 3px 16px'
        }
      }
    },
    myDialog: {
      h2: {
        color: Color['orange-400']
      },
      h3: {
        color: Color['neutral-200']
      },
      details: {
        color: Color['neutral-600']
      }
    },
    pageTitle: {
      color: Color['neutral-600'],
      badge: {
        background: Color['stratosphere-400'],
        color: Color.white
      }
    },
    plainCard: {
      header: {
        color: Color['neutral-550']
      }
    },
    subNav: {
      link: {
        borderBottom: Color.transparent,
        color: Color['neutral-600'],
        svg: {
          color: Color['neutral-600']
        },
        currentSvg: {
          borderBottom: Color['orange-400']
        }
      }
    }
  }
};

export default light;
