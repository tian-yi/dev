---
title: What are Python Wheels
date: '2021-03-10'
---

Python .whl files, or
[wheels](https://packaging.python.org/glossary/#term-wheel), are
little-discussed part of Python, but they've been a boon to the installation
process for Python packages. If you've installed a Python package using pip,
then chances are that a wheel has made the install faster and more efficient.

Wheels are a component of the Python ecosystem that helps to make pckage
installs just work. They allow for faster installations and more stability in
the package distribution process. In this tutorial, you'll dive into what
wheels are, what good they server, and how they've gained traction and made
Python even more of a joy to work with.

In this tutorial, you'll learn:
* What wheels are and how they compare to source distributions.
* How you can use wheels to control the package installation process.
* How to create and distribute wheels for your own Python packages.

You'll see examples using popular open source Python packages from both the
user's and the developer's perspective.

### Setup

To follow along, activate a virtual environment and make sure you have the
latest versions of pip, wheel, and setuptools installed.

```shell
$ python -m venv env && source ./env/bin/activate
$ python -m pip install -U pip wheel setuptools
# Successfully installed pip 20.1 setuptools-46.1.3 wheel-0.34.2
```
That's all you need to experiment with installing and building wheels.

### Python packaging made better: An intro to Python wheels

Before you learn how to package a project into a wheel, it helps to know what
using one look like from the user's side. It may sound backward, but a good way
to learn how wheels work is to start by installing something that isn't a
wheel.

You can start this experiment by installing a Python package into your
environment just as you might normally do. In this case, install uWsgi version
2.0x:
<Screenshot>
To fully install uWsgi, pip progresses through serveral distinct steps:
1. On line3, it downloads a TAR file(tarball) named uwsgi-2.0.18.tar.gz that's
   been compressed with gzip.
2. On line 6, it takes the tarball and builds a .whl file through a call to
   setup.py.
3. On line 7, it labels the wheel
   uWSGI-2.0.18-cp38-cp38-macosx_10_15_x86_64.whl.
4. On line 10, it installs the actual package after having built the wheel.

The tar.gz tarball that pip retrieves is a source distribution, or sdist,
rather than a wheel. In some ways, a sdist is the opposite of a wheel.

A source distribution contains source code. That includes not only Python code
but also the source code of any extension modules(usually in C or C++) bundled
with the package. With source distribution, extension modules are compiled on
the user's side rather than the developer's.

Source distribution also contain a bundle of metadata sitting in a directory
called <package-name>.egg-info. This metadata helps with building and
installing the package, but user's don't really need to do anything with it.

From the developer's perspective, a source distribution is what gets created
when you run the following command.
```shell
python setup.py sdist
```

Now try installing a different package, chardet.
You can see a noticeable different output than the uWSGI install.
Installing chardet downloads a .whl file directly from PyPI. The wheel name
chardet-3.0.4-py2.py3-none-any.whl  follows a specific naming convention that
you'll see later. What's more important from the user's perspective is that
there's no build stage when pip finds a compatible wheel on PyPI.

From the developer's side, a wheel is the result of running the following
command:

```shell
python setup.py bdist_wheel
```

Why does uWSGI hand you a source distribution while chardet provides a wheel?
You can see the reason for this by taking a look at each project's page on PYPI
and navigating to the Download files area. This section will show you what pip
actually sees on the PyPI index server:

* uWSGI [provides only a source
  distribution](https://pypi.org/project/uWSGI/2.0.18/#files)(uwsgi-2.0.18.tar.gz)
  for reasons related to the complexity of the project.
* Chardet [provides both a wheel and a source
  distribution](https://pypi.org/project/chardet/3.0.4/#files), but pip will
  prefer the wheel if it's compatible with your system. You'll see how that
  compatibility is determined later on.

Another example of the compatibility check used for wheel installation is
psycopg2, which provides a wide set of wheels for Windows but doesn't provide
any for Linux or macOS clients. This means that pip install psycopg2 could
fetch a wheel or a source distribution depending on your specific setup.

To avoid these types of compatibility issues, some packages offer multiple
wheels, with each wheel geared toward a specific Python implementation and
underlying operating system.

So far, you've seen some of the visible distinctions between a wheel and sdist,
but what matters more is the impact those differences have on the installation
process.

## Wheels Make Things Go Faster
Above, you saw a comparison of an installation that fetches a prebuilt wheel
and one that downloads sdist. Wheels make the end-to-end installation of Python
packages faster for two reasons:

1. All else being equal, wheels are typically smaller in size than source
   distributions, meaning they can move faster across a network.
2. Installing from wheels directly avoids the intermediate step of building
   packages off of the source distribution.

It's almost guaranteed that the chardet install occured in a fraction of the
time required for uWSGI. However, that's arguably an unfair apples-to-oranges
comparison since chardet is a significantly smaller and less complex
package. With a different command, you can create a more direct comparison that
will demonstrate just how much of a difference wheels make.

You can make pip ignore its inclination towards wheels by passing the
--no-binary option:

```shell
 time python -m pip install \
      --no-cache-dir \
      --force-reinstall \
      --no-binary=:all: \
      cryptography
```

This command times the installation of the cryptography package, telling pip to
use a source distribution even if a suitable wheel is available. Including
:all: makes the rule apply to cryptography and all of its dependencies.

On my machine, this takes around thirty-two seconds from start to finish. Not
only does the install take a long time, but building cryptography also requires
that you have the OpenSSL development headers present and available to Python.

Note: With --no-binary, you may very well see an error about missing header
files required for the cryptography install, which is part of what can make
using source distribution frustrating. If so, the installation section of the
cryptography docs advices on which libraries and header files you'll need for a
particular operating system.

Now you can resintall cryptography, but this time make sure that pip uses
wheels from PyPI. Because pip will prefer a wheel, this is similar t ojust
calling pip install with no arguments at all. But in this case, you can make
the intent explicit by requiring a wheel with --only-binary:
```shell
time python -m pip install \
      --no-cache-dir \
      --force-reinstall \
      --only-binary=cryptography \
      cryptography
```
This option takes just over four seconds, or one-eighth the time that it took
when using only source distribution for cryptography and its dependencies.

## What is a Python Wheel?
A Python .whl file is essentially a ZIP(.zip) archive with a specially crafted
filename that tells installers what Python versions and platform the wheel will
support.

A wheel is a type of built distribution. In this case, built means that the
wheel comes in a ready-to-install format and allows you to skip the build stage
required with source distributions.

Note: It's worth mentioning that despite the use of the term built, a wheel
doesn't contain .pyc files, or compiled Python bytecode.

A wheel filename is broken down into parts separated by hyphens:
```text
{dist}-{version}(-{build})?-{python}-{abi}-{platform}.whl
```
Each section in {brackets} is a tag, or a component of the wheel name that
carries some meaning about what the wheel contains and where the wheel will or
will not work.

Here's an illustrative example using a cryptography wheel:
```text
cryptography-2.9.2-cp35-abi3-macosx_10_9_x86_64.whl
```
cryptography distributes multiple wheels. Each wheel is a platform
wheel, meaning it supports only specific combinations of Python versions,
Python ABIs, operating systems, and machine architectures. You can break down
the naming convention into parts:
* cryptography is the package name.
* 2.9.2 is the package version of cryptography. A version is a PEP 440
  compliant string such as 2.9.2, 3.4, or 3.9.0.a3
* cp35 is the Python tag and denotes the Python implementation and version that
  the wheel demands. The cp stands for CPython, the reference implementation of
  Python, while the 35 denotes Python3.5. This wheel wouldn't be compatible
  with Jython, for instance.
* abi3 is the ABI tag. ABI stands for application binary interface. You don't
  really need to worry about what it entails, but abi3 is a separate version
  for the binary compatibility of the Python C API.
* macosx_10_0_x86_64 is the platform tag, which happens to be quite a
  mouthful. In this case it can be broken down further into sub-parts:
  * macosx is the macOS operating system.
  * 10_9 is the macOS developer tools SDK version used to compile the Python
    that in turn built this wheel.
  * x86_64 is a reference to x86-64 instruction set architecture.

The final component isn't technically a tag but rather the standard .whl file
extension. Combined, the above components indicate the target machine that this
cryptography wheel is designed for.

Now let's turn to a different example. Here's what you saw in the above case
for chardet:
```text
cahrdet-3.0.4-py2.py3-none-any.whl
```
You can break this down into its tags:
* chardet is the package name.
* 3.0.4 is the package version of chardet.
* py2.py3 is the Python tag. meaning the wheel supports Python 2 and 3 with any
  Python implementation.
* none is the ABI tag, meaning ABI isn't factor.
* any is the platform. This wheel will work on virtually any platform.

The py2.py3-none-any.whl segment of wheel name is common. This is a universal
wheel that will install with Python 2 or 3 on any platform with any ABI. if
the wheel ends in none-any.whl, then it's very likely a pure-Python package
that doesn't care about specific Python ABI or CPU architecture.

Another example is the jinja2 template engine. If you navigate to the download
page for the Jinja 3.x alpha release, then you'll see the following wheel:

```text
Jija2-3.0.0a1-py3-none-any.whl
```
Notice the lack of py2 here. There is a pure-Python project that will work on
any Python 3.x version, but it's no a universal wheel because it doesn't
support Python 2. Instead, it's called a pure-Python wheel.

Note: in 2020, a number of projects are also dropping support for Python 2,
which reached end-of-life(EOL) on January 1, 2020. Jinja version 3.x dropped
Python 2 support in February 2020.

Here are a few more examples of .whl names distributed for some popular open
source packages:

| Wheel         | What it is |
| ------------- | ------------- |
| PyYAML-5.3.1-cp38-cp38-win_amd64.whl   | PyYAML for CPython 3.8 on Windows with AMD64 (x86-64) architecture  |
| numpy-1.18.4-cp38-cp38-win32.whl   |  NumPy for CPython 3.8 on Windows 32-bit |
| scipy-1.4.1-cp36-cp36m-macosx-10-6-intel.whl | SciPy for CPython 3.6 on macOS 10.6 SDK with fat binary (multiple instruction sets) |

Now that you have a thorough understand of what wheels are, it's time to talk
about what good they serve.

## Advantages of Python Wheels

Here's a testament to wheels from the Python Package Authority (PyPA):
> Not all developers have the right tools or experiences to build these
> components written in these compiled languages, so Python created the wheel, a
> package format designed to ship libraries with compiled artifacts. In fact,
> Python’s package installer, pip, always prefers wheels because installation is
> always faster, so even pure-Python packages work better with
> wheels. ([Source](https://packaging.python.org/overview/#python-binary-distributions))

A fuller description is that wheels benefit both users and maintainers of
Python packages alike in handful of ways:

* Wheels install faster than source distributions for both pure-Python packages
  and extension modules.
* Wheels are smaller than source distinctions. For example, the six wheel is
  about one-third the size of the corresponding source distribution. This
  differential becomes even more important when you consider that a pip install
  for a single package may actually kick off downloading a chain of
  dependencies.
* Wheels cut setup.py execution out of the equation. Install from a source
  distribution runs whatever is contained in that projects' setup.py. As
  pointed out by PEP 427, this amounts to arbitrary code execution. Wheels
  avoid this altogether.
* There's no need for a compiler to install wheels that contain compiled
  extension modules. The extension module comes included with thewheel
  targeting a specific platform and Python version.
* pip automatically generates .pyc files in the wheel that match the right
  Python interpreter.
* Wheels provide consistency by cutting many of the variables involved in
  installing a package out of the equation.

You can use a project's Download files tab on PyPI to view the different
distributions that are available. For example, pandas distributes a wide
array of wheels.

## Telling pip What to Download

It's possible to exert fine-grained control over pip an tell it which format to
prefer to avoid. You can use the --only-binary and --no-binary options o do
this. You saw these used in an earlier section on installing the cryptography
package, but it's worth taking a closer look at what they do:

```shell
$ pushd "$(mktemp -d)"
$ python -m pip download --only-binary :all: --dest . --no-cache six
Collecting six
  Downloading six-1.14.0-py2.py3-none-any.whl (10 kB)
  Saved ./six-1.14.0-py2.py3-none-any.whl
Successfully downloaded six
```

In this example, you change to a temporary directory to store the download with
pushed "$(mktemp -d)". You use pip download rather than pip install so that you
can inspect the resulting wheel, but you can replace download with install
while keeping the same set of options.

You download the six module with several flags:
* --only-binary :all:tells pip to constrain itself to using wheels and ignore
  source distributions. Without this option, pip will only prefer wheels but
  will fall back to source distributions in some scenarios.
* --dest . tells pip to download six to the current directory.
* --no-cache tells pip not to look in its local download cache. You use this
  option just to illustrate a live download from PyPI since it's likely you do
  have a six cache somewhere.

I mentioned earlier that a wheel file is essentially a .zip archive. You can
take this statement literally and treat wheels as such. For instance, if you
want to view a wheel's contents, you can use unzip:

```shell
$ unzip -l six*.whl
Archive:  six-1.14.0-py2.py3-none-any.whl
  Length      Date    Time    Name
---------  ---------- -----   ----
    34074  01-15-2020 18:10   six.py
     1066  01-15-2020 18:10   six-1.14.0.dist-info/LICENSE
     1795  01-15-2020 18:10   six-1.14.0.dist-info/METADATA
      110  01-15-2020 18:10   six-1.14.0.dist-info/WHEEL
        4  01-15-2020 18:10   six-1.14.0.dist-info/top_level.txt
      435  01-15-2020 18:10   six-1.14.0.dist-info/RECORD
---------                     -------
    37484                     6 files
```

`six` is a special case: it's actually a single Python module rather than a
complete package. Wheel files can also be significantly more complex, as you'll
see later on.

In contrast to --only-binary, you can use --no-binary to do the opposite:
```shell
$ python -m pip download --no-binary :all: --dest . --no-cache six
Collecting six
  Downloading six-1.14.0.tar.gz (33 kB)
  Saved ./six-1.14.0.tar.gz
Successfully downloaded six
$ popd
```

The only change in this example is to switch to `--no-binary :all:`. This tells
pip to ignore wheels even if they're available and instead download a source
distribution.

When might --no-binary be useful? Here a few cases:
* **The corresponding wheel is broken.** This is an irony of wheels. They're
  designed to make things break less often, but in some cases a wheel can be
  mis-configured. In this case, downloading and building the source
  distribution for yourself may be a working alternative.
* **You want to apply a small change or patch file** to the project and then
  install it. This is an alternative to clone the project from its version
  control system URL.

You can also use the flags described above with pip install. Additionally,
instead of `:all:`, which will apply the `--only-binary` rule not just to package
you're installing but to all of its dependencies, you can pass `--only-binary`
and `--no-binary` a list of specific packages to apply that rule to.

Here are a few examples for installing the URL library `yarl`. It contains Cython
code and depends on multidict, which contains pure C code. There are several
options to strictly use or strictly ignore wheels for `yarl` and its
dependencies:

```shell
$ # Install `yarl` and use only wheels for yarl and all dependencies
$ python -m pip install --only-binary :all: yarl

$ # Install `yarl` and use wheels only for the `multidict` dependency
$ python -m pip install --only-binary multidict yarl

$ # Install `yarl` and don't use wheels for yarl or any dependencies
$ python -m pip install --no-binary :all: yarl

$ # Install `yarl` and don't use wheels for the `multidict` dependency
$ python -m pip install --no-binary multidict yarl
```

In this section, you got a glimpse of how to fine-tune the distribution types
that pip install will use. While a regular pip install should work with no
options, it's helpful to know these options for special cases.

## The many linux Wheel Tag
