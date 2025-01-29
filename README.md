# MultilabelDTree

Table of Contents
=================
   * [Installation](#installation)
      * [Requirements](#requirements)
      * [Instructions](#instructions)
   * [Description](#description)
       * [Overview](#overview)
       * [Steps](#steps)
       * [Technologies](#technologies)
   * [Database](#database)
       * [Schema](#schema)
   * [Graphical User Interface](#graphical-user-interface)

# Installation

## Requirements

* Apache2
* Mysql Server
* php

## Instructions

* Clone the project to a folder <br/>
  `$ git clone https://github.com/alexoiik/MultilabelDTree.git`

 * Make sure the folder is accessible from Apache Server. You may need to specify the following settings.

 * You should create in Mysql the database named 'multilabeldtree' and load the data from the multilabeldtree_db.sql file into this database.

 * You should make the file lib/db_upass.php which will contain:
```
    <?php
        $DB_PASS = 'password';
        $DB_USER = 'username';
        $REMOTE_HOST = 'localhost';
        $DB_SCHEMA = 'multilabeldtree';
        $DB_USER_LOCAL = 'root';
    ?>
```

# Description

## Overview

MultilabelDTree is an automated machine learning web application for classifying multi-label data through decision trees. Our application incorporates cutting-edge techniques, including BinaryRelevance, LabelPowerset and ClassifierChain transformation approaches, to ensure that your data is classified accurately and efficiently. By integrating AutoML, we automate the entire process, allowing you to focus on extracting insights and making impactful decisions with the best accuracy.

## Steps

1. **Log In or Sign Up to Unlock Full Access**: Log in to your existing account, or sign up to experience our application features. Build new models and classify data using your top-performing pretrained models, all within a comprehensive and user-friendly environment.

2. **Test Parameters & Evaluate Models**: Test your parameters by choosing between pre-uploaded datasets or the ones you personally own and get your model evaluation. For even greater efficiency, enable Auto mode to let the app automatically discover the optimal values with the best accuracy.
  
4. **Save Your Model & Visualize DTrees**: Once the evaluation process is complete, save your highest-performing models in your account for future use. Easily export your models in PKL format, or visualize the Decision Tree graphs to gain deeper insights into your model's structure.

5. **Classify Data by using Pretrained Models**: Finally, upload unclassified datasets and predict their labels by using your pretrained models. Once the predictions are complete, export the full results as a .csv file for easy analysis. Additionally, access detailed metrics to assess the quality and accuracy of your predictions.

## Technologies

* Html/css
* JavaScript
* MySQL
* php

# Database

## Schema

  - users:
      - id
      - fname
      - lname
      - email
      - pass
      - token
      - email_verification
      - public_permission
  - verify_account
      - id
      - user_id
      - verif_key
      - creation_time
  - models
      - id
      - user_id
      - transformation_approach
      - model_name
  - labels
      - id
      - model_id
      - label_name

# Graphical User Interface

![MultilabelDTree](/src/assets/img/MultilabelDTree.png?raw=true "MultilabelDTree")